import * as yup from 'yup';

import { SEPDataSource } from '../datasources/SEPDataSource';
import { EventBusDecorator, ValidateArgsDecorator } from '../decorators';
import { Event } from '../events/event.enum';
import { SEP } from '../models/SEP';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { UpdateSEPArgs } from '../resolvers/mutations/UpdateSEPMutation';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';

const createSEPValidationSchema = yup.object().shape({
  code: yup.string().required(),
  description: yup.string().required(),
  numberRatingsRequired: yup.number().min(2),
});

const updateSEPValidationSchema = yup.object().shape({
  id: yup.number().required(),
  code: yup.string().required(),
  description: yup.string().required(),
  numberRatingsRequired: yup.number().min(2),
});

export default class SEPMutations {
  constructor(
    private dataSource: SEPDataSource,
    private userAuth: UserAuthorization
  ) {}

  @ValidateArgsDecorator(createSEPValidationSchema)
  @EventBusDecorator(Event.SEP_CREATED)
  async create(
    agent: User | null,
    args: CreateSEPArgs
  ): Promise<SEP | Rejection> {
    if (agent == null) {
      return rejection('NOT_LOGGED_IN');
    }

    // Check if user officer, if not reject
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection('INSUFFICIENT_PERMISSIONS');
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
  }

  @ValidateArgsDecorator(updateSEPValidationSchema)
  @EventBusDecorator(Event.SEP_UPDATED)
  async update(
    agent: User | null,
    args: UpdateSEPArgs
  ): Promise<SEP | Rejection> {
    if (agent == null) {
      return rejection('NOT_LOGGED_IN');
    }

    // Check if user officer, if not reject
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    return this.dataSource
      .update(
        args.id,
        args.code,
        args.description,
        args.numberRatingsRequired,
        args.active
      )
      .then(sep => sep)
      .catch(err => {
        logger.logException(
          'Could not update scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }
}
