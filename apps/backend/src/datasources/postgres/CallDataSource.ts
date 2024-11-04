import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';

import { Call } from '../../models/Call';
import { CallHasInstrument } from '../../models/CallHasInstrument';
import { CreateCallInput } from '../../resolvers/mutations/CreateCallMutation';
import {
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
  UpdateCallInput,
  UpdateFapToCallInstrumentInput,
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
    const query = database('call').select([
      '*',
      'call.description as description',
    ]);
    if (filter?.shortCode) {
      query.where('call_short_code', 'like', `%${filter.shortCode}%`);
    }

    if (filter?.templateIds) {
      query.whereIn('template_id', filter.templateIds);
    }

    if (filter?.pdfTemplateIds) {
      query.whereIn('pdf_template_id', filter.pdfTemplateIds);
    }

    if (filter?.fapReviewTemplateIds) {
      query.whereIn('fap_review_template_id', filter.fapReviewTemplateIds);
    }

    if (filter?.esiTemplateIds) {
      query.whereIn('esi_template_id', filter.esiTemplateIds);
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
      query.where('end_call', '<=', currentDate);
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

    if (filter?.fapIds?.length) {
      query
        .leftJoin('call_has_faps as chs', 'chs.call_id', 'call.call_id')
        .whereIn('chs.fap_id', filter.fapIds)
        .distinctOn('call.call_id');
    }

    if (filter?.instrumentIds?.length) {
      query
        .leftJoin('call_has_instruments as chi', 'chi.call_id', 'call.call_id')
        .whereIn('chi.instrument_id', filter.instrumentIds)
        .distinctOn('call.call_id');
    }

    if (filter?.isFapReviewEnded === true) {
      query.where('call_fap_review_ended', true);
    } else if (filter?.isFapReviewEnded === false) {
      query.where('call_fap_review_ended', false);
    }

    if (filter?.isCallEndedByEvent === true) {
      query.where('call_ended', true);
    } else if (filter?.isCallEndedByEvent === false) {
      query.where('call_ended', false);
    }

    if (filter?.proposalStatusShortCode) {
      query
        .join(
          'proposal_workflow_connections as w',
          'call.proposal_workflow_id',
          'w.proposal_workflow_id'
        )
        .leftJoin(
          'proposal_statuses as s',
          'w.proposal_status_id',
          's.proposal_status_id'
        )
        .where('s.short_code', filter.proposalStatusShortCode)
        .distinctOn('call.call_id');
    }

    return query.then((callDB: CallRecord[]) =>
      callDB.map((call) => createCallObject(call))
    );
  }

  async getCallHasInstrumentsByInstrumentIds(
    instrumentIds: number[]
  ): Promise<CallHasInstrument[]> {
    return database
      .select()
      .from('call_has_instruments')
      .whereIn('instrument_id', instrumentIds)
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
            start_fap_review: args.startFapReview,
            end_fap_review: args.endFapReview,
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
            fap_review_template_id: args.fapReviewTemplateId,
            technical_review_template_id: args.technicalReviewTemplateId,
            allocation_time_unit: args.allocationTimeUnit,
            title: args.title,
            description: args.description,
          })
          .into('call')
          .returning('*')
          .transacting(trx);

        // NOTE: Attach Faps to a call if they are provided.
        if (createdCall[0].call_id && args.faps?.length) {
          const valuesToInsert = args.faps.map((fapId) => ({
            fap_id: fapId,
            call_id: createdCall[0].call_id,
          }));

          await database
            .insert(valuesToInsert)
            .into('call_has_faps')
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

        const { referenceNumberFormat } = args;

        if (
          referenceNumberFormat &&
          referenceNumberFormat !== preUpdateCall.reference_number_format
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

          await Promise.all(
            proposals.map(async (proposal) =>
              database
                .update({
                  proposal_id: await calculateReferenceNumber(
                    referenceNumberFormat,
                    proposal.reference_number_sequence
                  ),
                })
                .from('proposals')
                .where('proposal_pk', proposal.proposal_pk)
                .transacting(trx)
            )
          );
        }

        // NOTE: Attach Faps to a call if they are provided.
        if (args.id && args.faps !== undefined) {
          const valuesToInsert = args.faps.map((fapId) => ({
            fap_id: fapId,
            call_id: args.id,
          }));
          // NOTE: Remove all assigned Faps from a call and then re-assign
          await database('call_has_faps')
            .del()
            .where('call_id', args.id)
            .transacting(trx);

          if (valuesToInsert.length) {
            await database
              .insert(valuesToInsert)
              .into('call_has_faps')
              .transacting(trx);
          }
        }

        /*
         Work out whether the call_ended and call_ended_internal flags need updating.
        */
        const determineCallEndedFlag = (
          newFlagValue: boolean | undefined,
          previousFlagValue: boolean | undefined,
          endCall: Date | undefined
        ) => {
          // Use the new value if explicitly passed in.
          if (newFlagValue) {
            return newFlagValue;
          }

          /*
           If the call end date has been changed to the future, set to false.
          */
          if (endCall && endCall.getTime() > currentDate.getTime()) {
            return false;
          }

          /*
           Where the date has been changed to the past, leave the flag unchanged from
           its previous value. If it's false, the call end event will fire for this
           call and update the flags, and if true it indicates an old call being updated).
          */
          return previousFlagValue;
        };

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
              start_fap_review: args.startFapReview,
              end_fap_review: args.endFapReview,
              start_notify: args.startNotify,
              end_notify: args.endNotify,
              start_cycle: args.startCycle,
              end_cycle: args.endCycle,
              cycle_comment: args.cycleComment,
              submission_message: args.submissionMessage,
              survey_comment: args.surveyComment,
              proposal_workflow_id: args.proposalWorkflowId,
              call_ended: determineCallEndedFlag(
                args.callEnded,
                preUpdateCall.call_ended,
                args.endCall
              ),
              call_ended_internal: determineCallEndedFlag(
                args.callEndedInternal,
                preUpdateCall.call_ended_internal,
                args.endCallInternal
              ),
              call_review_ended: args.callReviewEnded,
              call_fap_review_ended: args.callFapReviewEnded,
              template_id: args.templateId,
              esi_template_id: args.esiTemplateId,
              pdf_template_id: args.pdfTemplateId,
              fap_review_template_id: args.fapReviewTemplateId,
              technical_review_template_id: args.technicalReviewTemplateId,
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
    const valuesToInsert = args.instrumentFapIds.map((instrumentFap) => ({
      instrument_id: instrumentFap.instrumentId,
      fap_id: instrumentFap.fapId,
      call_id: args.callId,
    }));

    await database.insert(valuesToInsert).into('call_has_instruments');

    const callUpdated = await this.getCall(args.callId);

    if (callUpdated) {
      return callUpdated;
    }

    throw new GraphQLError(`Call not found ${args.callId}`);
  }

  async updateFapToCallInstrument(
    args: UpdateFapToCallInstrumentInput
  ): Promise<Call> {
    await database
      .update({ fap_id: args.fapId ?? null })
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
  public async getCallByQuestionId(questionId: string): Promise<Call> {
    const records: CallRecord[] = await database('call')
      .leftJoin(
        'templates_has_questions',
        'templates_has_questions.template_id',
        'call.template_id'
      )
      .leftJoin(
        'answers',
        'answers.question_id',
        'templates_has_questions.question_id'
      )
      .where('answers.question_id', questionId);

    return createCallObject(records[0]);
  }
}
