import {
  addStatusActionsToConnectionValidationSchema,
  addWorkflowStatusValidationSchema,
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
import {
  WorkflowConnection,
  WorkflowConnectionWithStatus,
} from '../models/WorkflowConnections';
import { AddConnectionStatusActionsInput } from '../resolvers/mutations/settings/AddConnectionStatusActionsMutation';
import { AddStatusChangingEventsToConnectionInput } from '../resolvers/mutations/settings/AddStatusChangingEventsToConnectionMutation';
import { AddWorkflowStatusInput } from '../resolvers/mutations/settings/AddWorkflowStatusMutation';
import { CreateWorkflowInput } from '../resolvers/mutations/settings/CreateWorkflowMutation';
import { DeleteWorkflowStatusInput } from '../resolvers/mutations/settings/DeleteWorkflowStatusMutation';
import { MoveWorkflowStatusInput } from '../resolvers/mutations/settings/MoveWorkflowStatusMutation';
import { UpdateWorkflowInput } from '../resolvers/mutations/settings/UpdateWorkflowMutation';
import { EmailStatusActionRecipients } from '../resolvers/types/StatusActionConfig';
import { omit } from '../utils/helperFunctions';

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

  // TODO: It is messy code but it works! Clean it from here to the bottom!
  orderAndConnectAllWorkflowStatusesInSameDroppableGroup(
    workflowConnections: WorkflowConnection[],
    isInTheMiddleOfAGroup: boolean
  ) {
    return workflowConnections.map((workflowConnection, index) => {
      const nextShouldNotBeTouched =
        isInTheMiddleOfAGroup && index === workflowConnections.length - 1;

      return {
        ...workflowConnection,
        sortOrder: index,
        prevStatusId: workflowConnections[index - 1]
          ? workflowConnections[index - 1].statusId
          : null,
        nextStatusId: nextShouldNotBeTouched
          ? workflowConnection.nextStatusId
          : workflowConnections[index + 1]
            ? workflowConnections[index + 1].statusId
            : null,
      };
    });
  }

  async deleteParentGroupLastConnection(
    lastConnectionInParentDroppableGroup: WorkflowConnection
  ) {
    return await this.dataSource.deleteWorkflowStatus(
      lastConnectionInParentDroppableGroup.statusId,
      lastConnectionInParentDroppableGroup.workflowId,
      lastConnectionInParentDroppableGroup.sortOrder
    );
  }

  getNewOrUpdatedLastConnectionInParentGroup(
    lastConnectionInParentDroppableGroup: WorkflowConnection,
    firstConnectionStatusId: number
  ) {
    const lastConnectionInParentGroupHasNext =
      !!lastConnectionInParentDroppableGroup.nextStatusId;

    lastConnectionInParentDroppableGroup.nextStatusId = firstConnectionStatusId;

    if (lastConnectionInParentGroupHasNext) {
      const newConnection = omit(lastConnectionInParentDroppableGroup, 'id');

      return newConnection as WorkflowConnection;
    } else {
      return lastConnectionInParentDroppableGroup;
    }
  }

  async updateWorkflowConnectionStatuses(
    workflowConnections: WorkflowConnection[],
    {
      isInTheMiddleOfAGroup = false,
      isLastConnectionInParentGroup = false,
      isFirstConnectionInChildGroup = false,
    }
  ) {
    const updatedWorkflowConnections =
      this.orderAndConnectAllWorkflowStatusesInSameDroppableGroup(
        workflowConnections,
        isInTheMiddleOfAGroup
      );

    const [firstConnection, secondConnection] = updatedWorkflowConnections;
    const parentDroppableGroupId = firstConnection.parentDroppableGroupId;

    if (parentDroppableGroupId) {
      const [lastConnectionInParentDroppableGroup] =
        await this.dataSource.getWorkflowConnectionsById(
          workflowConnections[0].workflowId,
          workflowConnections[0].prevStatusId as number,
          {
            nextStatusId:
              secondConnection && isFirstConnectionInChildGroup
                ? workflowConnections[1]?.statusId
                : null,
          }
        );

      if (secondConnection && isFirstConnectionInChildGroup) {
        updatedWorkflowConnections[0].prevStatusId =
          workflowConnections[1].prevStatusId;
      } else {
        updatedWorkflowConnections[0].prevStatusId =
          lastConnectionInParentDroppableGroup?.statusId;
      }

      updatedWorkflowConnections[0].prevStatusId =
        lastConnectionInParentDroppableGroup?.statusId;

      if (isFirstConnectionInChildGroup) {
        if (secondConnection) {
          // Remove connection if there was one between parent group last status and this group second status because now we have new status in between.
          await this.deleteParentGroupLastConnection(
            lastConnectionInParentDroppableGroup
          );
        }

        // If last connection already has next we add new connection. If not we update the existing one with next of the current group first connection.
        const lastUpdatedOrNewInsertedConnection =
          this.getNewOrUpdatedLastConnectionInParentGroup(
            lastConnectionInParentDroppableGroup,
            firstConnection.statusId
          );

        updatedWorkflowConnections.push(lastUpdatedOrNewInsertedConnection);
      }
    }

    if (isLastConnectionInParentGroup) {
      const lastConnection =
        updatedWorkflowConnections.pop() as WorkflowConnection;
      const secondLastConnection = updatedWorkflowConnections.slice(-1)[0];
      const findAllConnectionsByParentGroup = true;

      // Delete connection between second last and last connection if there is one.
      if (secondLastConnection) {
        const secondLastConnectionInitialSortOrder = workflowConnections.find(
          (workflowConnection) =>
            workflowConnection.statusId === secondLastConnection.statusId &&
            workflowConnection.prevStatusId ===
              secondLastConnection.prevStatusId
        )?.sortOrder;

        await this.dataSource.deleteWorkflowStatus(
          secondLastConnection.statusId,
          secondLastConnection.workflowId,
          secondLastConnectionInitialSortOrder || secondLastConnection.sortOrder
        );
      }

      // Find all potential first child connections and connect them with new parent
      const allFirstChildrenGroupConnections = (
        await this.dataSource.getWorkflowConnections(
          lastConnection.workflowId,
          lastConnection.droppableGroupId,
          findAllConnectionsByParentGroup
        )
      )
        .filter((childConnection) => childConnection.sortOrder === 0)
        .map((firstChildConnection) => ({
          ...firstChildConnection,
          prevStatusId: lastConnection.statusId,
        }));

      if (
        allFirstChildrenGroupConnections &&
        allFirstChildrenGroupConnections.length > 0
      ) {
        updatedWorkflowConnections.push(...allFirstChildrenGroupConnections);

        allFirstChildrenGroupConnections.forEach((firstChildConnection) => {
          updatedWorkflowConnections.push({
            ...lastConnection,
            nextStatusId: firstChildConnection.statusId,
          });
        });
      }
    }

    return await this.dataSource.updateWorkflowStatuses(
      updatedWorkflowConnections
    );
  }

  async insertWorkflowStatus(args: AddWorkflowStatusInput) {
    return this.dataSource.addWorkflowStatus(args);
  }

  async insertNewAndUpdateExistingWorkflowStatuses(
    args: AddWorkflowStatusInput
  ) {
    const newWorkflowConnection = args as WorkflowConnectionWithStatus;
    const allWorkflowGroupConnections =
      await this.dataSource.getWorkflowConnections(
        args.workflowId,
        args.droppableGroupId,
        false
      );

    const isFirstConnectionInChildGroup =
      newWorkflowConnection.sortOrder === 0 &&
      !!newWorkflowConnection.prevStatusId;

    const isLastConnectionInParentGroup =
      newWorkflowConnection.sortOrder === allWorkflowGroupConnections.length &&
      !!newWorkflowConnection.nextStatusId;

    // Insert new connection in the correct place inside its group
    allWorkflowGroupConnections.splice(
      newWorkflowConnection.sortOrder,
      0,
      newWorkflowConnection
    );

    const isInTheMiddleOfAGroup =
      newWorkflowConnection.sortOrder > 0 &&
      newWorkflowConnection.sortOrder < allWorkflowGroupConnections.length - 1;
    const insertedWorkflowConnection = (
      await this.updateWorkflowConnectionStatuses(allWorkflowGroupConnections, {
        isInTheMiddleOfAGroup,
        isFirstConnectionInChildGroup,
        isLastConnectionInParentGroup,
      })
    )[newWorkflowConnection.sortOrder];

    return insertedWorkflowConnection;
  }

  @ValidateArgs(addWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async addWorkflowStatus(
    agent: UserWithRole | null,
    args: AddWorkflowStatusInput
  ): Promise<WorkflowConnection | Rejection> {
    const isVeryFirstConnection = !args.nextStatusId && !args.prevStatusId;
    try {
      if (isVeryFirstConnection) {
        return this.insertWorkflowStatus(args);
      } else {
        return this.insertNewAndUpdateExistingWorkflowStatuses(args);
      }
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

  // NOTE: This is not in use currently.
  moveArrayElement(
    workflowConnections: WorkflowConnection[],
    fromIndex: number,
    toIndex: number
  ) {
    const workflowConnectionToMove = workflowConnections[fromIndex];

    workflowConnections.splice(
      workflowConnections.indexOf(workflowConnectionToMove),
      1
    );

    workflowConnections.splice(toIndex, 0, workflowConnectionToMove);

    return workflowConnections;
  }

  // NOTE: Moving statuses inside workflow is not enabled at the moment so this is not used at all. I keep it if we deceide to use this feature later.
  @ValidateArgs(moveWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async moveWorkflowStatus(
    agent: UserWithRole | null,
    args: MoveWorkflowStatusInput
  ): Promise<WorkflowConnection | Rejection> {
    try {
      const allSourceGroupWorkflowConnections =
        await this.dataSource.getWorkflowConnections(
          args.workflowId,
          args.from.droppableId
        );

      let reorderedWorkflowConnections: WorkflowConnection[] = [];

      if (args.from.droppableId === args.to.droppableId) {
        reorderedWorkflowConnections = this.moveArrayElement(
          allSourceGroupWorkflowConnections,
          args.from.index,
          args.to.index
        );
      }

      const isFirstConnectionInChildGroup = args.to.index === 0;

      await this.updateWorkflowConnectionStatuses(
        reorderedWorkflowConnections,
        { isFirstConnectionInChildGroup }
      );

      return reorderedWorkflowConnections[args.to.index];
    } catch (error) {
      return rejection(
        'Could not move workflow status',
        { agent, args },
        error
      );
    }
  }

  async findPreviousAndNextConnections(
    workflowId: number,
    {
      currentStatusId,
      previousStatusId,
      nextStatusId,
    }: {
      currentStatusId: number;
      previousStatusId: number | null;
      nextStatusId: number | null;
    }
  ) {
    const [previousConnection] = previousStatusId
      ? await this.dataSource.getWorkflowConnectionsById(
          workflowId,
          previousStatusId,
          {
            nextStatusId: currentStatusId,
          }
        )
      : [];

    const [nextConnection] = nextStatusId
      ? await this.dataSource.getWorkflowConnectionsById(
          workflowId,
          nextStatusId,
          {
            prevStatusId: currentStatusId,
          }
        )
      : [];

    return [previousConnection, nextConnection];
  }

  @ValidateArgs(deleteWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteWorkflowStatus(
    agent: UserWithRole | null,
    args: DeleteWorkflowStatusInput
  ): Promise<boolean | Rejection> {
    try {
      // NOTE: We can have more than one connection if it is multi-column workflow
      const workflowConnectionsToRemove =
        await this.dataSource.getWorkflowConnectionsById(
          args.workflowId,
          args.statusId,
          { sortOrder: args.sortOrder }
        );

      const [firstWorkflowConnectionToRemove] = workflowConnectionsToRemove;

      if (!firstWorkflowConnectionToRemove) {
        return rejection(
          'Can not delete workflow connection because first connection not found',
          { workflowConnectionsToRemove }
        );
      }

      const allGroupWorkflowConnections =
        await this.dataSource.getWorkflowConnections(
          args.workflowId,
          firstWorkflowConnectionToRemove.droppableGroupId
        );

      const isLastConnectionInGroupRemoved =
        firstWorkflowConnectionToRemove.sortOrder + 1 ===
        allGroupWorkflowConnections.length;
      const lastConnectionInParentGroupRemoved =
        isLastConnectionInGroupRemoved &&
        firstWorkflowConnectionToRemove.nextStatusId &&
        firstWorkflowConnectionToRemove.prevStatusId;

      if (lastConnectionInParentGroupRemoved) {
        const [workflowConnectionToReplaceRemoved] =
          await this.dataSource.getWorkflowConnectionsById(
            firstWorkflowConnectionToRemove.workflowId,
            firstWorkflowConnectionToRemove.prevStatusId as number,
            {}
          );

        if (!workflowConnectionToReplaceRemoved) {
          return rejection(
            'Can not delete workflow connection because connection to replace is not found',
            { firstWorkflowConnectionToRemove }
          );
        }

        workflowConnectionsToRemove.forEach(async (connection) => {
          const updatedWorkflowConnections: WorkflowConnection[] = [];

          if (connection.nextStatusId) {
            const [nextConnection] =
              await this.dataSource.getWorkflowConnectionsById(
                connection.workflowId,
                connection.nextStatusId as number,
                {}
              );

            if (nextConnection) {
              updatedWorkflowConnections.push({
                ...nextConnection,
                prevStatusId: connection.prevStatusId,
              });
            }
          }

          updatedWorkflowConnections.push({
            ...connection,
            prevStatusId: workflowConnectionToReplaceRemoved.prevStatusId,
            statusId: workflowConnectionToReplaceRemoved.statusId,
            sortOrder: workflowConnectionToReplaceRemoved.sortOrder,
          });

          await this.dataSource.updateWorkflowStatuses(
            updatedWorkflowConnections
          );
        });

        await this.dataSource.deleteWorkflowStatus(
          workflowConnectionToReplaceRemoved.statusId,
          workflowConnectionToReplaceRemoved.workflowId,
          workflowConnectionToReplaceRemoved.sortOrder
        );
      } else {
        const result = await this.dataSource.deleteWorkflowStatus(
          args.statusId,
          args.workflowId,
          args.sortOrder
        );

        const [previousConnection, nextConnection] =
          await this.findPreviousAndNextConnections(args.workflowId, {
            currentStatusId: result.statusId,
            previousStatusId: result.prevStatusId,
            nextStatusId: result.nextStatusId,
          });

        const connectionsToUpdate = [];

        if (previousConnection) {
          connectionsToUpdate.push({
            ...previousConnection,
            nextStatusId: result.nextStatusId,
          });
        }

        if (nextConnection) {
          connectionsToUpdate.push({
            ...nextConnection,
            prevStatusId: result.prevStatusId,
          });
        }

        await this.dataSource.updateWorkflowStatuses(connectionsToUpdate);
      }

      return true;
    } catch (error) {
      return rejection(
        'Could not delete proposal workflow status',
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
