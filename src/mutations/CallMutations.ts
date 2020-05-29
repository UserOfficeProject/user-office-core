import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized } from '../decorators';
import { Call } from '../models/Call';
import { Roles } from '../models/Role';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateCallArgs } from '../resolvers/mutations/CreateCallMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class CallMutations {
  constructor(
    private dataSource: CallDataSource,
    private userAuth: UserAuthorization
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: User | null,
    args: CreateCallArgs
  ): Promise<Call | Rejection> {
    return this.dataSource
      .create(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not create call', error, {
          agent,
          shortCode: args.shortCode,
        });

        return rejection('INTERNAL_ERROR');
      });
  }
}
