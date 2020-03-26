import { SEPDataSource } from '../datasources/SEPDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { EventBus } from '../events/eventBus';
import { SEP } from '../models/SEP';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class SEPMutations {
  constructor(
    private dataSource: SEPDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async create(
    agent: User | null,
    args: CreateSEPArgs
  ): Promise<SEP | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection('NOT_LOGGED_IN');
        }

        // Check if there is an open call, if not reject
        if (!(await this.userAuth.isUserOfficer(agent))) {
          return rejection('NOT_ALLOWED');
        }

        return this.dataSource
          .create(
            args.code,
            args.description,
            args.numberRatingsRequired,
            args.active
          )
          .then(sep => sep)
          .catch(err => {
            logger.logException(
              'Could not create scientific evaluation panel',
              err,
              { agent }
            );

            return rejection('INTERNAL_ERROR');
          });
      },
      sep => {
        return {
          type: Event.SEP_CREATED,
          sep,
          loggedInUserId: agent ? agent.id : null,
        };
      }
    );
  }
}
