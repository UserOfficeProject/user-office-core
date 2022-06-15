import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { ScheduledEventsCoreArgs } from '../../resolvers/queries/ScheduledEventsCoreQuery';
import { ScheduledEventDataSource } from '../ScheduledEventDataSource';
import database from './database';
import { createScheduledEventObject, ScheduledEventRecord } from './records';

export default class PostgresScheduledEventDataSource
  implements ScheduledEventDataSource
{
  async getScheduledEventsCore({
    filter,
  }: ScheduledEventsCoreArgs): Promise<ScheduledEventCore[]> {
    return database
      .select()
      .from('scheduled_events')
      .modify((query) => {
        if (filter?.endsBefore) {
          query.where('ends_at', '<', filter.endsBefore);
        }
        if (filter?.endsAfter) {
          query.where('ends_at', '>', filter.endsAfter);
        }
        if (filter?.startsBefore) {
          query.where('starts_at', '<', filter.startsBefore);
        }
        if (filter?.startsAfter) {
          query.where('starts_at', '>', filter.startsAfter);
        }
        if (filter?.instrumentId) {
          query
            .leftJoin(
              'instrument_has_proposals',
              'instrument_has_proposals.proposal_pk',
              'scheduled_events.proposal_pk'
            )
            .where(
              'instrument_has_proposals.instrument_id',
              filter.instrumentId
            );
        }
        if (filter?.callId) {
          query
            .leftJoin(
              'proposals',
              'proposals.proposal_pk',
              'scheduled_events.proposal_pk'
            )
            .where('proposals.call_id', filter.callId);
        }
        const { from, to } = filter?.overlaps || {};
        if (from && to) {
          query.where((builder) =>
            builder
              .orWhere((subBuilder) =>
                subBuilder
                  .where('scheduled_events.starts_at', '>=', from)
                  .andWhere('scheduled_events.starts_at', '<=', to)
              )
              .orWhere((subBuilder) =>
                subBuilder
                  .where('scheduled_events.ends_at', '>=', from)
                  .andWhere('scheduled_events.ends_at', '<=', to)
              )
              .orWhere((subBuilder) =>
                subBuilder
                  .where('scheduled_events.starts_at', '<=', from)
                  .andWhere('scheduled_events.ends_at', '>=', from)
              )
              .orWhere((subBuilder) =>
                subBuilder
                  .where('scheduled_events.starts_at', '<=', to)
                  .andWhere('scheduled_events.ends_at', '>=', to)
              )
          );
        }
      })
      .then((rows: ScheduledEventRecord[]) =>
        rows.map((row) => createScheduledEventObject(row))
      );
  }
  async getScheduledEventCore(id: number): Promise<ScheduledEventCore | null> {
    return database
      .select('*')
      .from('scheduled_events')
      .where('scheduled_event_id', id)
      .first()
      .then((row: ScheduledEventRecord) =>
        row ? createScheduledEventObject(row) : null
      );
  }
}
