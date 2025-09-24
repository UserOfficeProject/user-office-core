import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { DataAccessUsersDataSource } from '../datasources/DataAccessUsersDataSource';
import { BasicUserDetails, UserWithRole } from '../models/User';

@injectable()
export default class DataAccessUsersQueries {
  constructor(
    @inject(Tokens.DataAccessUsersDataSource)
    private dataSource: DataAccessUsersDataSource
  ) {}

  async findByProposalPk(
    agent: UserWithRole | null,
    proposalPk: number
  ): Promise<BasicUserDetails[]> {
    return this.dataSource.findByProposalPk(proposalPk);
  }
}
