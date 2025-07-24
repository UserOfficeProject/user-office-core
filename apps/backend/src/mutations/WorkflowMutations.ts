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
import { Workflow } from '../models/Workflow';
import { WorkflowConnection } from '../models/WorkflowConnections';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';
import { AddStatusChangingEventsToConnectionInput } from '../resolvers/mutations/settings/AddStatusChangingEventsToConnectionMutation';
import { AddWorkflowStatusInput } from '../resolvers/mutations/settings/AddWorkflowStatusMutation';
import { CreateWorkflowInput } from '../resolvers/mutations/settings/CreateWorkflowMutation';
import { DeleteWorkflowStatusInput } from '../resolvers/mutations/settings/DeleteWorkflowStatusMutation';
import { UpdateWorkflowInput } from '../resolvers/mutations/settings/UpdateWorkflowMutation';
import { UpdateWorkflowStatusInput } from '../resolvers/mutations/settings/UpdateWorkflowStatusMutation';
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

  private async updateXYForNodesWithStatusId(
    workflowId: number,
    statusId: number,
    posX: number,
    posY: number
  ): Promise<void> {
    const connectionsWithSameStatusId =
      await this.dataSource.getWorkflowConnectionsById(
        workflowId,
        statusId,
        {}
      );

    for (const connection of connectionsWithSameStatusId) {
      connection.posX = posX;
      connection.posY = posY;
      await this.dataSource.updateWorkflowStatus(connection);
    }
  }

  private async getExistingOrCreateNewWFConnection(
    args: UpdateWorkflowStatusInput
  ): Promise<WorkflowConnection | null> {
    const currentConnection = await this.dataSource.getWorkflowConnection(
      args.id
    );

    if (!currentConnection) {
      return null;
    }

    if (
      args.prevStatusId === undefined ||
      currentConnection.prevStatusId === null ||
      args.prevStatusId === currentConnection.prevStatusId
    ) {
      return currentConnection;
    }

    const newWorkflowConnection = await this.dataSource.addWorkflowStatus({
      workflowId: currentConnection.workflowId,
      statusId: currentConnection.statusId,
      prevStatusId: args.prevStatusId,
      nextStatusId: currentConnection.nextStatusId,
      posX: args.posX ?? currentConnection.posX,
      posY: args.posY ?? currentConnection.posY,
      sortOrder: currentConnection.sortOrder,
    });

    return newWorkflowConnection;
  }

  @Authorized([Roles.USER_OFFICER])
  async updateWorkflowStatus(
    agent: UserWithRole | null,
    args: UpdateWorkflowStatusInput
  ): Promise<WorkflowConnection | Rejection> {
    try {
      // Get the current workflow connection
      const connection = await this.getExistingOrCreateNewWFConnection(args);

      if (!connection) {
        return rejection(
          'Workflow connection not found',
          { agent, args },
          new Error('Connection not found')
        );
      }

      await this.updateXYForNodesWithStatusId(
        connection.workflowId,
        connection.statusId,
        args.posX ?? connection.posX,
        args.posY ?? connection.posY
      );

      const updatedConnection = new WorkflowConnection(
        connection.id,
        connection.sortOrder,
        connection.workflowId,
        connection.statusId,
        args.nextStatusId ?? connection.nextStatusId,
        args.prevStatusId ?? connection.prevStatusId,
        args.posX ?? connection.posX,
        args.posY ?? connection.posY
      );

      return await this.dataSource.updateWorkflowStatus(updatedConnection);
    } catch (error) {
      return rejection(
        'Could not update workflow status',
        { agent, args },
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
