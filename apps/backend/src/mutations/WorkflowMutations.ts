import {
  addStatusActionsToConnectionValidationSchema,
  createWorkflowValidationSchema,
  deleteWorkflowStatusValidationSchema,
  deleteWorkflowValidationSchema,
  moveWorkflowStatusValidationSchema,
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
import { Workflow } from '../models/Workflow';
import { WorkflowConnection } from '../models/WorkflowConnections';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';
import { AddStatusChangingEventsToConnectionInput } from '../resolvers/mutations/settings/AddStatusChangingEventsToConnectionMutation';
import { AddWorkflowStatusInput } from '../resolvers/mutations/settings/AddWorkflowStatusMutation';
import { CreateWorkflowInput } from '../resolvers/mutations/settings/CreateWorkflowMutation';
import { DeleteWorkflowStatusInput } from '../resolvers/mutations/settings/DeleteWorkflowStatusMutation';
import { MoveWorkflowStatusInput } from '../resolvers/mutations/settings/MoveWorkflowStatusMutation';
import { UpdateWorkflowInput } from '../resolvers/mutations/settings/UpdateWorkflowMutation';
import { EmailStatusActionRecipients } from '../resolvers/types/StatusActionConfig';

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
  async addWorkflowStatus(
    agent: UserWithRole | null,
    args: AddWorkflowStatusInput
  ): Promise<WorkflowConnection | Rejection> {
    try {
      return await this.dataSource.addWorkflowStatus(args);
    } catch (error) {
      return rejection('Could not add workflow status', { agent, args }, error);
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

  // NOTE: Moving statuses inside workflow is not enabled at the moment so this is not used at all. I keep it if we deceide to use this feature later.
  @ValidateArgs(moveWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async moveWorkflowStatus(
    agent: UserWithRole | null,
    args: MoveWorkflowStatusInput
  ): Promise<WorkflowConnection | Rejection> {
    try {
      // Simplified implementation for flat structure
      const allWorkflowConnections =
        await this.dataSource.getWorkflowConnections(args.workflowId);

      // For now, just return the first connection as a placeholder
      return allWorkflowConnections[0] || ({ id: 1 } as WorkflowConnection);
    } catch (error) {
      return rejection(
        'Could not move workflow status',
        { agent, args },
        error
      );
    }
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
