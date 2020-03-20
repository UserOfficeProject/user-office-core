import { CallDataSource } from '../datasources/CallDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { EventBus } from '../events/eventBus';
import { Call } from '../models/Call';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateCallArgs } from '../resolvers/mutations/CreateCallMutation';
import { logger } from '../utils/Logger';

export default class CallMutations {
  constructor(
    private dataSource: CallDataSource,
    private userAuth: any,
    private eventBus: EventBus<ApplicationEvent>
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
