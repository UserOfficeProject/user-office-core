import { CallDataSource } from '../datasources/CallDataSource';
import { Call } from '../models/Call';
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

  async create(
    agent: User | null,
    args: CreateCallArgs
  ): Promise<Call | Rejection> {
    if (agent == null) {
      return rejection('NOT_LOGGED_IN');
    }
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection('NOT_USER_OFFICER');
    }

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
