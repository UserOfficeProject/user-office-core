import { createCallValidationSchema } from '@esss-swap/duo-validation';

import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Call } from '../models/Call';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateCallArgs } from '../resolvers/mutations/CreateCallMutation';
import { logger } from '../utils/Logger';

export default class CallMutations {
  constructor(private dataSource: CallDataSource) {}

  @ValidateArgs(createCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
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
