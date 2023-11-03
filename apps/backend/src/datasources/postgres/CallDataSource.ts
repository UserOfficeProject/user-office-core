import { logger } from '@user-office-software/duo-logger';
import BluePromise from 'bluebird';
import { GraphQLError } from 'graphql';

import { Call } from '../../models/Call';
import { CallHasInstrument } from '../../models/CallHasInstrument';
import { CreateCallInput } from '../../resolvers/mutations/CreateCallMutation';
import {
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
  UpdateCallInput,
  UpdateSepToCallInstrumentInput,
} from '../../resolvers/mutations/UpdateCallMutation';
import { CallDataSource } from '../CallDataSource';
import { CallsFilter } from './../../resolvers/queries/CallsQuery';
import database from './database';
import { calculateReferenceNumber } from './ProposalDataSource';
import {
  CallHasInstrumentRecord,
  CallRecord,
  createCallHasInstrumentObject,
  createCallObject,
  ProposalRecord,
} from './records';

export default class PostgresCallDataSource implements CallDataSource {
  async delete(id: number): Promise<Call> {
    return database
      .where('call.call_id', id)
      .del()
      .from('call')
      .returning('*')
      .then((call: CallRecord[]) => createCallObject(call[0]));
  }
  async getCall(id: number): Promise<Call | null> {
    return database
      .select()
      .from('call')
      .where('call_id', id)
      .first()
      .then((call: CallRecord | null) =>
        call ? createCallObject(call) : null
      );
  }

  async getCalls(filter?: CallsFilter): Promise<Call[]> {
    const query = database('call').select(['*']);
    if (filter?.templateIds) {
      query.whereIn('template_id', filter.templateIds);
    }

    if (filter?.pdfTemplateIds) {
      query.whereIn('pdf_template_id', filter.pdfTemplateIds);
    }

    // if filter is explicitly set to true or false
    if (filter?.isActive === true) {
      query.where('is_active', true);
    } else if (filter?.isActive === false) {
      query.where('is_active', false);
    }

    if (filter?.isEndedInternal === true) {
      query.where('call_ended_internal', true);
    } else if (filter?.isEndedInternal === false) {
      query.where('call_ended_internal', false);
    }

    /**
     * NOTE: We are comparing dates instead of using the call_ended flag,
     * because the flag is set once per hour and we could have a gap.
     * TODO: Maybe there is a need to use the timezone setting here but not quite sure about it. Discussion is needed here!
     */
    const currentDate = new Date().toISOString();

    // if filter is explicitly set for internal filter of calls
    if (
      filter?.isActive === true &&
      filter?.isActiveInternal === true &&
      filter?.isEnded === false
    ) {
      query
        .where('start_call', '<=', currentDate)
        .andWhere('end_call_internal', '>=', currentDate);
    } else if (filter?.isEnded === true) {
      query
        .where('start_call', '>=', currentDate)
        .andWhere('end_call', '<=', currentDate);
    } else if (filter?.isEnded === false) {
      query
        .where('start_call', '<=', currentDate)
        .andWhere('end_call', '>=', currentDate);
    } else if (filter?.isActiveInternal === true) {
      query
        .where('end_call', '<', currentDate)
        .andWhere('end_call_internal', '>=', currentDate);
    } else if (filter?.isActiveInternal === false) {
      query.where('call_ended_internal', '=', true);
    }

    if (filter?.isReviewEnded === true) {
      query.where('call_review_ended', true);
    } else if (filter?.isReviewEnded === false) {
      query.where('call_review_ended', false);
    }

    if (filter?.sepIds?.length) {
      query
        .leftJoin('call_has_seps as chs', 'chs.call_id', 'call.call_id')
        .whereIn('chs.sep_id', filter.sepIds)
        .distinctOn('call.call_id');
    }

    if (filter?.instrumentIds?.length) {
      query
        .leftJoin('call_has_instruments as chi', 'chi.call_id', 'call.call_id')
        .whereIn('chi.instrument_id', filter.instrumentIds)
        .distinctOn('call.call_id');
    }

    if (filter?.isSEPReviewEnded === true) {
      query.where('call_sep_review_ended', true);
    } else if (filter?.isSEPReviewEnded === false) {
      query.where('call_sep_review_ended', false);
    }

    if (filter?.isCallEndedByEvent === true) {
      query.where('call_ended', true);
    } else if (filter?.isCallEndedByEvent === false) {
      query.where('call_ended', false);
    }

    return query.then((callDB: CallRecord[]) =>
      callDB.map((call) => createCallObject(call))
    );
  }

  async getCallHasInstrumentsByInstrumentId(
    instrumentId: number
  ): Promise<CallHasInstrument[]> {
    return database
      .select()
      .from('call_has_instruments')
      .where('instrument_id', instrumentId)
      .then((callHasInstrument: CallHasInstrumentRecord[]) =>
        callHasInstrument.map((callHasInstrument) =>
          createCallHasInstrumentObject(callHasInstrument)
        )
      );
  }

  async create(args: CreateCallInput): Promise<Call> {
    const [call]: CallRecord[] = await database.transaction(async (trx) => {
      try {
        const createdCall: CallRecord[] = await database
          .insert({
            call_short_code: args.shortCode,
            start_call: args.startCall,
            end_call: args.endCall,
            end_call_internal: args.endCallInternal || args.endCall,
            start_review: args.startReview,
            end_review: args.endReview,
            start_sep_review: args.startSEPReview,
            end_sep_review: args.endSEPReview,
            start_notify: args.startNotify,
            end_notify: args.endNotify,
            start_cycle: args.startCycle,
            end_cycle: args.endCycle,
            cycle_comment: args.cycleComment,
            submission_message: args.submissionMessage,
            survey_comment: args.surveyComment,
            reference_number_format: args.referenceNumberFormat,
            proposal_sequence: args.proposalSequence,
            proposal_workflow_id: args.proposalWorkflowId,
            template_id: args.templateId,
            esi_template_id: args.esiTemplateId,
            pdf_template_id: args.pdfTemplateId,
            allocation_time_unit: args.allocationTimeUnit,
            title: args.title,
            description: args.description,
          })
          .into('call')
          .returning('*')
          .transacting(trx);

        // NOTE: Attach SEPs to a call if they are provided.
        if (createdCall[0].call_id && args.seps?.length) {
          const valuesToInsert = args.seps.map((sepId) => ({
            sep_id: sepId,
            call_id: createdCall[0].call_id,
          }));

          await database
            .insert(valuesToInsert)
            .into('call_has_seps')
            .transacting(trx);
        }

        return await trx.commit(createdCall);
      } catch (error) {
        logger.logException(
          `Could not create call with args: '${JSON.stringify(args)}'`,
          error
        );
        trx.rollback();

        throw new GraphQLError('Could not create call');
      }
    });

    return createCallObject(call);
  }

  async update(args: UpdateCallInput): Promise<Call> {
    const call = await database.transaction(async (trx) => {
      try {
        const currentDate = new Date();
        /*
         * Check if the reference number format has been changed,
         * in which case all proposals in the call need to be updated.
         */
        const preUpdateCall: Pick<
          CallRecord,
          | 'call_id'
          | 'reference_number_format'
          | 'call_ended_internal'
          | 'call_ended'
        > = await database
          .select(
            'c.call_id',
            'c.reference_number_format',
            'c.call_ended_internal',
            'c.call_ended'
          )
          .from('call as c')
          .where('c.call_id', args.id)
          .first()
          .forUpdate()
          .transacting(trx);

        if (
          args.referenceNumberFormat &&
          args.referenceNumberFormat !== preUpdateCall.reference_number_format
        ) {
          const proposals = (await database
            .select('p.proposal_pk', 'p.reference_number_sequence')
            .from('proposals as p')
            .where({ 'p.call_id': preUpdateCall.call_id, 'p.submitted': true })
            .forUpdate()
            .transacting(trx)) as Pick<
            ProposalRecord,
            'proposal_pk' | 'reference_number_sequence'
          >[];

          await BluePromise.map(
            proposals,
            async (p) => {
              await database
                .update({
                  proposal_id: await calculateReferenceNumber(
                    args.referenceNumberFormat!,
                    p.reference_number_sequence
                  ),
                })
                .from('proposals')
                .where('proposal_pk', p.proposal_pk)
                .transacting(trx);
            },
            { concurrency: 50 }
          );
        }

        // NOTE: Attach SEPs to a call if they are provided.
        if (args.id && args.seps !== undefined) {
          const valuesToInsert = args.seps.map((sepId) => ({
            sep_id: sepId,
            call_id: args.id,
          }));
          // NOTE: Remove all assigned SEPs from a call and then re-assign
          await database('call_has_seps')
            .del()
            .where('call_id', args.id)
            .transacting(trx);

          if (valuesToInsert.length) {
            await database
              .insert(valuesToInsert)
              .into('call_has_seps')
              .transacting(trx);
          }
        }

        const callUpdate = await database
          .update(
            {
              call_short_code: args.shortCode,
              start_call: args.startCall,
              end_call: args.endCall,
              end_call_internal: args.endCallInternal,
              reference_number_format: args.referenceNumberFormat,
              start_review: args.startReview,
              end_review: args.endReview,
              start_sep_review: args.startSEPReview,
              end_sep_review: args.endSEPReview,
              start_notify: args.startNotify,
              end_notify: args.endNotify,
              start_cycle: args.startCycle,
              end_cycle: args.endCycle,
              cycle_comment: args.cycleComment,
              submission_message: args.submissionMessage,
              survey_comment: args.surveyComment,
              proposal_workflow_id: args.proposalWorkflowId,
              call_ended:
                preUpdateCall.call_ended &&
                args.endCall &&
                args.endCall.getTime() < currentDate.getTime(),
              call_ended_internal: args.endCallInternal
                ? preUpdateCall.call_ended_internal &&
                  args.endCallInternal.getTime() < currentDate.getTime()
                : args.callEndedInternal,
              call_review_ended: args.callReviewEnded,
              call_sep_review_ended: args.callSEPReviewEnded,
              template_id: args.templateId,
              esi_template_id: args.esiTemplateId,
              pdf_template_id: args.pdfTemplateId,
              allocation_time_unit: args.allocationTimeUnit,
              title: args.title,
              description: args.description,
              is_active: args.isActive,
            },
            ['*']
          )
          .from('call')
          .where('call_id', args.id)
          .transacting(trx);

        return await trx.commit(callUpdate);
      } catch (error) {
        logger.logException(
          `Could not update call with id '${args.id}'`,
          error
        );
        trx.rollback();

        throw new GraphQLError('Could not update call');
      }
    });

    return createCallObject(call[0]);
  }

  async assignInstrumentsToCall(
    args: AssignInstrumentsToCallInput
  ): Promise<Call> {
    const valuesToInsert = args.instrumentSepIds.map((instrumentSep) => ({
      instrument_id: instrumentSep.instrumentId,
      sep_id: instrumentSep.sepId,
      call_id: args.callId,
    }));

    await database.insert(valuesToInsert).into('call_has_instruments');

    const callUpdated = await this.getCall(args.callId);

    if (callUpdated) {
      return callUpdated;
    }

    throw new GraphQLError(`Call not found ${args.callId}`);
  }

  async updateSepToCallInstrument(
    args: UpdateSepToCallInstrumentInput
  ): Promise<Call> {
    await database
      .update({ sep_id: args.sepId ?? null })
      .into('call_has_instruments')
      .where('instrument_id', args.instrumentId)
      .andWhere('call_id', args.callId);

    const callUpdated = await this.getCall(args.callId);

    if (callUpdated) {
      return callUpdated;
    }

    throw new GraphQLError(`Call not found ${args.callId}`);
  }

  async removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallInput
  ): Promise<Call> {
    await database('call_has_instruments')
      .del()
      .where('instrument_id', args.instrumentId)
      .andWhere('call_id', args.callId);

    const callUpdated = await this.getCall(args.callId);

    if (callUpdated) {
      return callUpdated;
    }

    throw new GraphQLError(`Call not found ${args.callId}`);
  }

  async getCallsByInstrumentScientist(scientistId: number): Promise<Call[]> {
    const records: CallRecord[] = await database('call')
      .distinct(['call.*'])
      .join(
        'call_has_instruments',
        'call_has_instruments.call_id',
        'call.call_id'
      )
      .join(
        'instrument_has_scientists',
        'instrument_has_scientists.instrument_id',
        'call_has_instruments.instrument_id'
      )
      .join(
        'instruments',
        'instruments.instrument_id',
        'call_has_instruments.instrument_id'
      )
      .where('instrument_has_scientists.user_id', scientistId)
      .orWhere('instruments.manager_user_id', scientistId);

    return records.map(createCallObject);
  }
  public async isCallEnded(callId: number): Promise<boolean>;
  public async isCallEnded(
    callId: number,
    checkIfInternalEnded: boolean
  ): Promise<boolean>;
  public async isCallEnded(
    callId: number,
    checkIfInternalEnded: boolean = false
  ): Promise<boolean> {
    const currentDate = new Date().toISOString();

    return database
      .select()
      .from('call')
      .where('start_call', '<=', currentDate)
      .andWhere(
        checkIfInternalEnded ? 'end_call_internal' : 'end_call',
        '>=',
        currentDate
      )
      .andWhere('call_id', '=', callId)
      .first()
      .then((call: CallRecord) => (call ? false : true));
  }
}
