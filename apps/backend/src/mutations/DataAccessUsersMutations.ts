import { updateDataAccessUsersValidationSchema } from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { DataAccessUsersAuthorization } from '../auth/DataAccessUsersAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { DataAccessUsersDataSource } from '../datasources/DataAccessUsersDataSource';
import { ValidateArgs } from '../decorators';
import { resolveApplicationEventBus } from '../events';
import { Event } from '../events/event.enum';
import { isRejection, rejection, Rejection } from '../models/Rejection';
import { BasicUserDetails, UserWithRole } from '../models/User';

export interface UpdateDataAccessUsersArgs {
  proposalPk: number;
  userIds: number[];
}

@injectable()
export default class DataAccessUsersMutations {
  constructor(
    @inject(Tokens.DataAccessUsersDataSource)
    private dataSource: DataAccessUsersDataSource,
    @inject(Tokens.DataAccessUsersAuthorization)
    private dataAccessUsersAuth: DataAccessUsersAuthorization,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization
  ) {}

  @ValidateArgs(updateDataAccessUsersValidationSchema)
  async updateDataAccessUsers(
    agent: UserWithRole | null,
    args: UpdateDataAccessUsersArgs
  ): Promise<BasicUserDetails[] | Rejection> {
    try {
      const { proposalPk, userIds } = args;

      const hasWriteRights =
        this.userAuth.isApiToken(agent) ||
        (await this.dataAccessUsersAuth.hasWriteRights(agent, proposalPk));
      if (!hasWriteRights) {
        return rejection('You do not have write rights for this proposal');
      }

      const result = await this.dataSource.updateDataAccessUsers(
        proposalPk,
        userIds
      );

      if (!isRejection(result)) {
        const eventBus = resolveApplicationEventBus();

        await eventBus.publish({
          type: Event.DATA_ACCESS_USERS_UPDATED,
          proposalPKey: proposalPk,
          key: 'proposalPk',
          loggedInUserId: agent ? agent.id : null,
          isRejection: false,
        });
      }

      return result;
    } catch (error) {
      return rejection('Failed to update data access users', { args }, error);
    }
  }
}
