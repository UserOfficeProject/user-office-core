import { updateDataAccessUsersValidationSchema } from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { DataAccessUsersDataSource } from '../datasources/DataAccessUsersDataSource';
import { ValidateArgs } from '../decorators';
import { rejection, Rejection } from '../models/Rejection';
import { BasicUserDetails, UserWithRole } from '../models/User';

export interface UpdateDataAccessUsersArgs {
  proposalPk: number;
  userIds: number[];
}

@injectable()
export default class DataAccessUsersMutations {
  constructor(
    @inject(Tokens.DataAccessUsersDataSource)
    private dataSource: DataAccessUsersDataSource
  ) {}

  @ValidateArgs(updateDataAccessUsersValidationSchema)
  async updateDataAccessUsers(
    agent: UserWithRole | null,
    args: UpdateDataAccessUsersArgs
  ): Promise<BasicUserDetails[] | Rejection> {
    try {
      const { proposalPk, userIds } = args;

      return await this.dataSource.updateDataAccessUsers(proposalPk, userIds);
    } catch (error) {
      return rejection('Failed to update data access users', { args }, error);
    }
  }
}
