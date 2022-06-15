import { logger } from '@user-office-software/duo-logger';
import BluePromise from 'bluebird';

import { Call } from '../../models/Call';
import { CreateCallInput } from '../../resolvers/mutations/CreateCallMutation';
import {
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
  UpdateCallInput,
} from '../../resolvers/mutations/UpdateCallMutation';
import { CallDataSource } from '../CallDataSource';
import { CallsFilter } from './../../resolvers/queries/CallsQuery';
import database from './database';
import { calculateReferenceNumber } from './ProposalDataSource';
import { CallRecord, createCallObject } from './records';

export default class PostgresCallDataSource implements CallDataSource {
  async delete(id: number): Promise<Call> {
    return database
      .where('call.call_id', id)
      .del()
      .from('call')
      .returning('*')
      .then((call: CallRecord[]) => {
        if (call === undefined || call.length !== 1) {
          throw new Error(`Could not delete call with id:${id}`);
        }

        return createCallObject(call[0]);
      });
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

    // if filter is explicitly set to true or false
    if (filter?.isActive === true) {
      const currentDate = new Date().toISOString();
      query
        .where('start_call', '<=', currentDate)
        .andWhere('end_call', '>=', currentDate);
    } else if (filter?.isActive === false) {
      const currentDate = new Date().toISOString();
      query
        .where('start_call', '>=', currentDate)
        .orWhere('end_call', '<=', currentDate);
    }

    if (filter?.isEnded === true) {
      query.where('call_ended', true);
    } else if (filter?.isEnded === false) {
      query.where('call_ended', false);
    }

    if (filter?.isReviewEnded === true) {
      query.where('call_review_ended', true);
    } else if (filter?.isReviewEnded === false) {
      query.where('call_review_ended', false);
    }

    if (filter?.isSEPReviewEnded === true) {
      query.where('call_sep_review_ended', true);
    } else if (filter?.isSEPReviewEnded === false) {
      query.where('call_sep_review_ended', false);
    }

    return query.then((callDB: CallRecord[]) =>
      callDB.map((call) => createCallObject(call))
    );
  }

  async create(args: CreateCallInput): Promise<Call> {
    return database
      .insert({
        call_short_code: args.shortCode,
        start_call: args.startCall,
        end_call: args.endCall,
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
        allocation_time_unit: args.allocationTimeUnit,
        title: args.title,
        description: args.description,
      })
      .into('call')
      .returning('*')
      .then((call: CallRecord[]) => {
        if (call.length !== 1) {
          throw new Error('Could not create call');
        }

        return createCallObject(call[0]);
      });
  }

  async update(args: UpdateCallInput): Promise<Call> {
    const call = await database.transaction(async (trx) => {
      try {
        /*
         * Check if the reference number format has been changed,
         * in which case all proposals in the call need to be updated.
         */
        const preUpdateCall = await database
          .select('c.call_id', 'c.reference_number_format')
          .from('call as c')
          .where('c.call_id', args.id)
          .first()
          .forUpdate()
          .transacting(trx);

        if (
          args.referenceNumberFormat &&
          args.referenceNumberFormat !== preUpdateCall.reference_number_format
        ) {
          const proposals = await database
            .select('p.proposal_pk', 'p.reference_number_sequence')
            .from('proposals as p')
            .where({ 'p.call_id': preUpdateCall.call_id, 'p.submitted': true })
            .forUpdate()
            .transacting(trx);

          await BluePromise.map(
            proposals,
            async (p) => {
              await database
                .update({
                  proposal_id: await calculateReferenceNumber(
                    args.referenceNumberFormat,
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

        const callUpdate = await database
          .update(
            {
              call_short_code: args.shortCode,
              start_call: args.startCall,
              end_call: args.endCall,
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
              call_ended: args.callEnded,
              call_review_ended: args.callReviewEnded,
              call_sep_review_ended: args.callSEPReviewEnded,
              template_id: args.templateId,
              esi_template_id: args.esiTemplateId,
              allocation_time_unit: args.allocationTimeUnit,
              title: args.title,
              description: args.description,
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
      }
    });

    if (call?.length !== 1) {
      throw new Error('Could not update call');
    }

    return createCallObject(call[0]);
  }

  async assignInstrumentsToCall(
    args: AssignInstrumentsToCallInput
  ): Promise<Call> {
    const valuesToInsert = args.instrumentIds.map((instrumentId) => ({
      instrument_id: instrumentId,
      call_id: args.callId,
    }));

    await database.insert(valuesToInsert).into('call_has_instruments');

    const callUpdated = await this.getCall(args.callId);

    if (callUpdated) {
      return callUpdated;
    }

    throw new Error(`Call not found ${args.callId}`);
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

    throw new Error(`Call not found ${args.callId}`);
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

  public async checkActiveCall(callId: number): Promise<boolean> {
    const currentDate = new Date().toISOString();

    return database
      .select()
      .from('call')
      .where('start_call', '<=', currentDate)
      .andWhere('end_call', '>=', currentDate)
      .andWhere('call_id', '=', callId)
      .first()
      .then((call: CallRecord) => (call ? true : false));
  }
}
