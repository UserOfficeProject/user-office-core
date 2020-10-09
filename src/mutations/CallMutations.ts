import {
  createCallValidationSchema,
  updateCallValidationSchema,
  assignInstrumentsToCallValidationSchema,
  removeAssignedInstrumentFromCallValidationSchema,
} from '@esss-swap/duo-validation';

import { CallDataSource } from '../datasources/CallDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { Call } from '../models/Call';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateCallArgs } from '../resolvers/mutations/CreateCallMutation';
import {
  UpdateCallArgs,
  AssignInstrumentToCallArgs,
  RemoveAssignedInstrumentFromCallArgs,
  AssignOrRemoveProposalWorkflowToCallInput,
} from '../resolvers/mutations/UpdateCallMutation';
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

  @ValidateArgs(updateCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: UpdateCallArgs
  ): Promise<Call | Rejection> {
    return this.dataSource
      .update(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not create call', error, {
          agent,
          shortCode: args.shortCode,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignInstrumentsToCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignInstrumentToCall(
    agent: UserWithRole | null,
    args: AssignInstrumentToCallArgs
  ): Promise<Call | Rejection> {
    return this.dataSource
      .assignInstrumentToCall(args)
      .then(result => result)
      .catch(error => {
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
    args: RemoveAssignedInstrumentFromCallArgs
  ): Promise<Call | Rejection> {
    return this.dataSource
      .removeAssignedInstrumentFromCall(args)
      .then(result => result)
      .catch(error => {
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

  // @ValidateArgs(assignInstrumentsToCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignProposalWorkflowToCall(
    agent: UserWithRole | null,
    args: AssignOrRemoveProposalWorkflowToCallInput
  ): Promise<Call | Rejection> {
    return this.dataSource
      .assignProposalWorkflowToCall(args)
      .then(result => result)
      .catch(error => {
        logger.logException(
          'Could not assign proposal workflow to call',
          error,
          {
            agent,
            args,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  // @ValidateArgs(removeAssignedInstrumentFromCallValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeAssignedProposalWorkflowFromCall(
    agent: UserWithRole | null,
    args: AssignOrRemoveProposalWorkflowToCallInput
  ): Promise<Call | Rejection> {
    return this.dataSource
      .removeAssignedProposalWorkflowFromCall(args)
      .then(result => result)
      .catch(error => {
        logger.logException(
          'Could not remove assigned proposal workflow from call',
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
