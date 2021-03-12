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
  async get(id: number): Promise<Call | null> {
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
        survey_comment: args.surveyComment,
        proposal_workflow_id: args.proposalWorkflowId,
        template_id: args.templateId,
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
    return database
      .update(
        {
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
          survey_comment: args.surveyComment,
          proposal_workflow_id: args.proposalWorkflowId,
          call_ended: args.callEnded,
          call_review_ended: args.callReviewEnded,
          call_sep_review_ended: args.callSEPReviewEnded,
          template_id: args.templateId,
        },
        ['*']
      )
      .from('call')
      .where('call_id', args.id)
      .then((call: CallRecord[]) => {
        if (call.length !== 1) {
          throw new Error('Could not update call');
        }

        return createCallObject(call[0]);
      });
  }

  async assignInstrumentsToCall(
    args: AssignInstrumentsToCallInput
  ): Promise<Call> {
    const valuesToInsert = args.instrumentIds.map((instrumentId) => ({
      instrument_id: instrumentId,
      call_id: args.callId,
    }));

    await database.insert(valuesToInsert).into('call_has_instruments');

    const callUpdated = await this.get(args.callId);

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

    const callUpdated = await this.get(args.callId);

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
      .where('instrument_has_scientists.user_id', scientistId);

    return records.map(createCallObject);
  }
}
