/* eslint-disable @typescript-eslint/camelcase */
import { Call } from '../../models/Call';
import { CreateCallArgs } from '../../resolvers/mutations/CreateCallMutation';
import { CallDataSource } from '../CallDataSource';
import { CallsFilter } from './../../resolvers/queries/CallsQuery';
import database from './database';
import { CallRecord, createCallObject } from './records';

export default class PostgresCallDataSource implements CallDataSource {
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

    return query.then((callDB: CallRecord[]) =>
      callDB.map(call => createCallObject(call))
    );
  }

  async create(args: CreateCallArgs): Promise<Call> {
    return database
      .insert({
        call_short_code: args.shortCode,
        start_call: args.startCall,
        end_call: args.endCall,
        start_review: args.startReview,
        end_review: args.endReview,
        start_notify: args.startNotify,
        end_notify: args.endNotify,
        cycle_comment: args.cycleComment,
        survey_comment: args.surveyComment,
        template_id: args.templateId,
      })
      .into('call')
      .returning(['*'])
      .then((call: CallRecord[]) => {
        if (call.length !== 1) {
          throw new Error('Could not create call');
        }

        return createCallObject(call[0]);
      });
  }
}
