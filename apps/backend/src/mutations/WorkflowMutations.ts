import {
  addStatusActionsToConnectionValidationSchema,
  createWorkflowValidationSchema,
  deleteWorkflowStatusValidationSchema,
  deleteWorkflowValidationSchema,
  updateWorkflowValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusActionsDataSource } from '../datasources/StatusActionsDataSource';
import { WorkflowDataSource } from '../datasources/WorkflowDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import {
  ConnectionHasStatusAction,
  StatusActionType,
} from '../models/StatusAction';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { UserWithRole } from '../models/User';
import { Workflow, WorkflowConnection } from '../models/Workflow';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';
import { AddStatusChangingEventsToConnectionInput } from '../resolvers/mutations/settings/AddStatusChangingEventsToConnectionMutation';
import { AddStatusToWorkflowArgs } from '../resolvers/mutations/settings/AddStatusToWorkflowMutation';
import { CreateWorkflowConnectionArgs } from '../resolvers/mutations/settings/CreateWorkflowConnectionMutation';
import { CreateWorkflowInput } from '../resolvers/mutations/settings/CreateWorkflowMutation';
import { DeleteWorkflowStatusInput } from '../resolvers/mutations/settings/DeleteWorkflowStatusMutation';
import { UpdateWorkflowInput } from '../resolvers/mutations/settings/UpdateWorkflowMutation';
import { UpdateWorkflowStatusArgs } from '../resolvers/mutations/settings/UpdateWorkflowStatusMutation';
import { EmailStatusActionRecipients } from '../resolvers/types/StatusActionConfig';
import { WorkflowStatus } from '../resolvers/types/WorkflowStatus';

@injectable()
export default class WorkflowMutations {
  constructor(
    @inject(Tokens.WorkflowDataSource)
    private dataSource: WorkflowDataSource,

    @inject(Tokens.StatusActionsDataSource)
    private statusActionsDataSource: StatusActionsDataSource
  ) {}

  @ValidateArgs(createWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createWorkflow(
    agent: UserWithRole | null,
    args: CreateWorkflowInput
  ): Promise<Workflow | Rejection> {
    return this.dataSource.createWorkflow(args).catch((error) => {
      return rejection('Could not create workflows', { agent, args }, error);
    });
  }

  @ValidateArgs(updateWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateWorkflow(
    agent: UserWithRole | null,
    args: UpdateWorkflowInput
  ): Promise<Workflow | Rejection> {
    return this.dataSource.updateWorkflow(args).catch((error) => {
      return rejection('Could not update workflow', { agent, args }, error);
    });
  }

  @ValidateArgs(deleteWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteWorkflow(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<Workflow | Rejection> {
    return this.dataSource.deleteWorkflow(args.id).catch((error) => {
      return rejection('Could not delete workflow', { agent, args }, error);
    });
  }

  @Authorized([Roles.USER_OFFICER])
  addStatusToWorkflow(
    agent: UserWithRole | null,
    args: AddStatusToWorkflowArgs
  ): Promise<WorkflowStatus | Rejection> {
    return this.dataSource.addStatusToWorkflow(args).catch((error) => {
      return rejection('Could not update workflow', { agent, args }, error);
    });
  }

  @Authorized([Roles.USER_OFFICER])
  async removeStatusFromWorkflow(
    agent: UserWithRole | null,
    workflowStatusId: number
  ): Promise<WorkflowStatus | Rejection> {
    return this.dataSource
      .removeStatusFromWorkflow(workflowStatusId)
      .catch((error) => {
        return rejection(
          'Could not remove status from workflow',
          { agent, workflowStatusId },
          error
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async updateWorkflowStatus(
    agent: UserWithRole | null,
    args: UpdateWorkflowStatusArgs
  ): Promise<WorkflowStatus | Rejection> {
    try {
      return await this.dataSource.updateWorkflowStatus(args);
    } catch (error) {
      return rejection(
        'Could not update workflow status',
        { agent, args },
        error
      );
    }
  }

  async createWorkflowConnection(
    user: UserWithRole | null,
    args: CreateWorkflowConnectionArgs
  ) {
    if (args.nextWorkflowStatusId === args.prevWorkflowStatusId) {
      throw new Error('Next and previous workflow status cannot be the same');
    }

    try {
      const newWorkflowConnection =
        await this.dataSource.createWorkflowConnection(args);

      return newWorkflowConnection;
    } catch (error) {
      return rejection(
        'Could not create workflow connection',
        { user, args },
        error
      );
    }
  }

  // @ValidateArgs(addNextStatusEventsValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async addStatusChangingEventsToConnection(
    agent: UserWithRole | null,
    args: AddStatusChangingEventsToConnectionInput
  ): Promise<StatusChangingEvent[] | Rejection> {
    return this.dataSource
      .addStatusChangingEventsToConnection(
        args.workflowConnectionId,
        args.statusChangingEvents
      )
      .catch((error) => {
        return rejection(
          'Could not add next status events',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(deleteWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteWorkflowStatus(
    agent: UserWithRole | null,
    args: DeleteWorkflowStatusInput
  ): Promise<boolean | Rejection> {
    try {
      await this.dataSource.deleteWorkflowStatus(
        args.statusId,
        args.workflowId,
        args.sortOrder
      );

      return true;
    } catch (error) {
      return rejection(
        'Could not delete workflow status',
        { agent, args },
        error
      );
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteWorkflowConnection(
    agent: UserWithRole | null,
    connectionId: number
  ): Promise<WorkflowConnection | Rejection> {
    try {
      const deletedConnection =
        await this.dataSource.deleteWorkflowConnection(connectionId);

      if (!deletedConnection) {
        return rejection(
          'Workflow connection not found',
          { agent, connectionId },
          new Error('Connection not found')
        );
      }

      return deletedConnection;
    } catch (error) {
      return rejection(
        'Could not delete workflow connection',
        { agent, connectionId },
        error
      );
    }
  }

  @ValidateArgs(
    addStatusActionsToConnectionValidationSchema<
      StatusActionType,
      EmailStatusActionRecipients
    >(
      StatusActionType.EMAIL,
      StatusActionType.RABBITMQ,
      StatusActionType.PROPOSALDOWNLOAD,
      Object.values(StatusActionType),
      EmailStatusActionRecipients.OTHER
    )
  )
  @Authorized([Roles.USER_OFFICER])
  async addConnectionStatusActions(
    agent: UserWithRole | null,
    connectionStatusActionsInput: AddConnectionStatusActionsInput
  ): Promise<ConnectionHasStatusAction[] | null> {
    return this.statusActionsDataSource.addConnectionStatusActions(
      connectionStatusActionsInput
    );
  }
}
