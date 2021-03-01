import { ResourceId } from '@esss-swap/duo-localisation';
import { logger } from '@esss-swap/duo-logger';
import {
  createCallValidationSchemas,
  updateCallValidationSchemas,
  assignInstrumentsToCallValidationSchema,
  removeAssignedInstrumentFromCallValidationSchema,
} from '@esss-swap/duo-validation';

import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Call } from '../models/Call';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateCallInput } from '../resolvers/mutations/CreateCallMutation';
import {
  UpdateCallInput,
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
} from '../resolvers/mutations/UpdateCallMutation';
import { mergeValidationSchemas } from '../utils/helperFunctions';

const createCallValidationSchema = mergeValidationSchemas(
  ...createCallValidationSchemas
);
const updateCallValidationSchema = mergeValidationSchemas(
  ...updateCallValidationSchemas
);

export default class CallMutations {
  constructor(private dataSource: CallDataSource) {}

  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    { callId }: { callId: number }
  ): Promise<Call | Rejection> {
    const call = await this.dataSource.get(callId);

    if (!call) {
      return rejection('NOT_FOUND');
    }

    try {
      const result = await this.dataSource.delete(callId);

      return result;
    } catch (e) {
      if ('code' in e && e.code === '23503') {
        return rejection(
          `Failed to delete call with ID "${call.shortCode}", it has dependencies which need to be deleted first` as ResourceId
        );
      }

      logger.logException('Failed to delete call', e, {
        agent,
        callId,
      });

      return rejection('INTERNAL_ERROR');
    }
  }

  @ValidateArgs(createCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    args: CreateCallInput
  ): Promise<Call | Rejection> {
    return this.dataSource
      .create(args)
      .then((result) => result)
      .catch((error) => {
        logger.logException('Could not create call', error, {
          agent,
          shortCode: args.shortCode,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: UpdateCallInput
  ): Promise<Call | Rejection> {
    return this.dataSource
      .update(args)
      .then((result) => result)
      .catch((error) => {
        logger.logException('Could not create call', error, {
          agent,
          shortCode: args.shortCode,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignInstrumentsToCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignInstrumentsToCall(
    agent: UserWithRole | null,
    args: AssignInstrumentsToCallInput
  ): Promise<Call | Rejection> {
    return this.dataSource
      .assignInstrumentsToCall(args)
      .then((result) => result)
      .catch((error) => {
        logger.logException('Could not assign instruments to call', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(removeAssignedInstrumentFromCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeAssignedInstrumentFromCall(
    agent: UserWithRole | null,
    args: RemoveAssignedInstrumentFromCallInput
  ): Promise<Call | Rejection> {
    return this.dataSource
      .removeAssignedInstrumentFromCall(args)
      .then((result) => result)
      .catch((error) => {
        logger.logException(
          'Could not remove assigned instrument from call',
          error,
          {
            agent,
            args,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }
}
