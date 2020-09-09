import { ProposalStatusDataSource } from '../datasources/ProposalStatusDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

export default class ProposalStatusQueries {
  constructor(private dataSource: ProposalStatusDataSource) {}

  @Authorized([Roles.USER_OFFICER])
  async get(agent: UserWithRole | null, id: number) {
    const proposalStatus = await this.dataSource.get(id);

    return proposalStatus;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null) {
    const proposalStatuses = await this.dataSource.getAll();

    return proposalStatuses;
  }
}
