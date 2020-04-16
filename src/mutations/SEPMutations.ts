import * as yup from 'yup';

import { SEPDataSource } from '../datasources/SEPDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { Roles } from '../models/Role';
import { SEP } from '../models/SEP';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { UpdateSEPArgs } from '../resolvers/mutations/UpdateSEPMutation';
import { logger } from '../utils/Logger';

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
  constructor(private dataSource: SEPDataSource) {}

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(createSEPValidationSchema)
  @EventBus(Event.SEP_CREATED)
  async create(
    agent: User | null,
    args: CreateSEPArgs
  ): Promise<SEP | Rejection> {
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

  @Authorized([Roles.USER_OFFICER])
  @ValidateArgs(updateSEPValidationSchema)
  @EventBus(Event.SEP_UPDATED)
  async update(
    agent: User | null,
    args: UpdateSEPArgs
  ): Promise<SEP | Rejection> {
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
