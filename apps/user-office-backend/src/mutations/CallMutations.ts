import {
  createCallValidationSchemas,
  updateCallValidationSchemas,
  assignInstrumentsToCallValidationSchema,
  removeAssignedInstrumentFromCallValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Call } from '../models/Call';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
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

@injectable()
export default class CallMutations {
  constructor(
    @inject(Tokens.CallDataSource) private dataSource: CallDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    { callId }: { callId: number }
  ): Promise<Call | Rejection> {
    const call = await this.dataSource.getCall(callId);

    if (!call) {
      return rejection('Call not found', { callId });
    }

    try {
      const result = await this.dataSource.delete(callId);

      return result;
    } catch (error) {
      // NOTE: We are explicitly casting error to { code: string } type because it is the easiest solution for now and because it's type is a bit difficult to determine because of knexjs not returning typed error message.
      if ((error as { code: string }).code === '23503') {
        return rejection(
          'Failed to delete call, it has dependencies which need to be deleted first',
          { callId },
          error
        );
      }

      return rejection(
        'Failed to delete call',
        {
          agent,
          callId,
        },
        error
      );
    }
  }

  @ValidateArgs(createCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.CALL_CREATED)
  async create(
    agent: UserWithRole | null,
    args: CreateCallInput
  ): Promise<Call | Rejection> {
    return this.dataSource
      .create(args)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not create call',
          { agent, shortCode: args.shortCode },
          error
        );
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
        return rejection(
          'Could not create call',
          { agent, shortCode: args.shortCode },
          error
        );
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
        return rejection(
          'Could not assign instruments to call',
          { agent, args },
          error
        );
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
        return rejection(
          'Could not remove assigned instrument from call',
          { agent, args },
          error
        );
      });
  }
}
