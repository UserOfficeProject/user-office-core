import { injectable } from 'tsyringe';

import { Call } from '../../models/Call';
import { CallsFilter } from '../../resolvers/queries/CallsQuery';
import { PaginationSortDirection } from '../../utils/pagination';
import PostgresCallDataSource from '../postgres/CallDataSource';

@injectable()
export default class StfcCallDataSource extends PostgresCallDataSource {
  async getCalls(
    filter?: CallsFilter,
    sortField?: string,
    sortDirection?: PaginationSortDirection,
    agentId?: number
  ): Promise<Call[]> {
    let calls = await super.getCalls(filter, sortField, sortDirection, agentId);

    if (filter?.excludeTechniqueCalls) {
      const techniqueCallIds = (
        await super.getCalls({ ...filter, proposalStatus: 'QUICK_REVIEW' })
      ).map((c) => c.id);
      calls = calls.filter((c) => !techniqueCallIds.includes(c.id));
    }

    return calls;
  }
}
