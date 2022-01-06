import {
  createProposalStatusValidationSchema,
  updateProposalStatusValidationSchema,
  deleteProposalStatusValidationSchema,
  createProposalWorkflowValidationSchema,
  updateProposalWorkflowValidationSchema,
  deleteProposalWorkflowValidationSchema,
  addProposalWorkflowStatusValidationSchema,
  moveProposalWorkflowStatusValidationSchema,
  deleteProposalWorkflowStatusValidationSchema,
  // addNextStatusEventsValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { ProposalStatus } from '../models/ProposalStatus';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import { ProposalWorkflowConnection } from '../models/ProposalWorkflowConnections';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { StatusChangingEvent } from '../models/StatusChangingEvent';
import { UserWithRole } from '../models/User';
import { AddProposalWorkflowStatusInput } from '../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { AddStatusChangingEventsToConnectionInput } from '../resolvers/mutations/settings/AddStatusChangingEventsToConnection';
import { CreateProposalStatusInput } from '../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { DeleteProposalWorkflowStatusInput } from '../resolvers/mutations/settings/DeleteProposalWorkflowStatusMutation';
import { MoveProposalWorkflowStatusInput } from '../resolvers/mutations/settings/MoveProposalWorkflowStatusMutation';
import { UpdateProposalStatusInput } from '../resolvers/mutations/settings/UpdateProposalStatusMutation';
import { UpdateProposalWorkflowInput } from '../resolvers/mutations/settings/UpdateProposalWorkflowMutation';
import { omit } from '../utils/helperFunctions';
@injectable()
export default class ProposalSettingsMutations {
  constructor(
    @inject(Tokens.ProposalSettingsDataSource)
    private dataSource: ProposalSettingsDataSource
  ) {}

  @ValidateArgs(createProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createProposalStatus(
    agent: UserWithRole | null,
    args: CreateProposalStatusInput
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource.createProposalStatus(args).catch((error) => {
      return rejection(
        'Could not create proposal status',
        { agent, args },
        error
      );
    });
  }

  @ValidateArgs(updateProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateProposalStatus(
    agent: UserWithRole | null,
    args: UpdateProposalStatusInput
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource.updateProposalStatus(args).catch((error) => {
      return rejection(
        'Could not update proposal status',
        { agent, args },
        error
      );
    });
  }

  @ValidateArgs(deleteProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteProposalStatus(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource.deleteProposalStatus(args.id).catch((error) => {
      return rejection(
        'Could not delete proposal status',
        { agent, args },
        error
      );
    });
  }

  @ValidateArgs(createProposalWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createProposalWorkflow(
    agent: UserWithRole | null,
    args: CreateProposalWorkflowInput
  ): Promise<ProposalWorkflow | Rejection> {
    return this.dataSource.createProposalWorkflow(args).catch((error) => {
      return rejection(
        'Could not create proposal workflow',
        { agent, args },
        error
      );
    });
  }

  @ValidateArgs(updateProposalWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateProposalWorkflow(
    agent: UserWithRole | null,
    args: UpdateProposalWorkflowInput
  ): Promise<ProposalWorkflow | Rejection> {
    return this.dataSource.updateProposalWorkflow(args).catch((error) => {
      return rejection(
        'Could not update proposal workflow',
        { agent, args },
        error
      );
    });
  }

  @ValidateArgs(deleteProposalWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteProposalWorkflow(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<ProposalWorkflow | Rejection> {
    return this.dataSource.deleteProposalWorkflow(args.id).catch((error) => {
      return rejection(
        'Could not delete proposal workflow',
        { agent, args },
        error
      );
    });
  }

  // TODO: It is messy code but it works! Clean it from here to the bottom!
  orderAndConnectAllWorkflowStatusesInSameDroppableGroup(
    proposalWorkflowConnections: ProposalWorkflowConnection[],
    isInTheMiddleOfAGroup: boolean
  ) {
    return proposalWorkflowConnections.map((workflowConnection, index) => {
      const nextShouldNotBeTouched =
        isInTheMiddleOfAGroup &&
        index === proposalWorkflowConnections.length - 1;

      return {
        ...workflowConnection,
        sortOrder: index,
        prevProposalStatusId: proposalWorkflowConnections[index - 1]
          ? proposalWorkflowConnections[index - 1].proposalStatusId
          : null,
        nextProposalStatusId: nextShouldNotBeTouched
          ? workflowConnection.nextProposalStatusId
          : proposalWorkflowConnections[index + 1]
          ? proposalWorkflowConnections[index + 1].proposalStatusId
          : null,
      };
    });
  }

  async getLastConnectionInParentDroppableGroup(
    proposalWorkflowId: number,
    droppableGroupId: string
  ) {
    const shouldSearchByParentDroppableGroup = false;

    return (
      await this.dataSource.getProposalWorkflowConnections(
        proposalWorkflowId,
        droppableGroupId,
        shouldSearchByParentDroppableGroup
      )
    ).pop() as ProposalWorkflowConnection;
  }

  getNewOrUpdatedLastConnectionInParentGroup(
    lastConnectionInParentDroppableGroup: ProposalWorkflowConnection,
    firstConnectionStatusId: number
  ) {
    const lastConnectionInParentGroupHasNext =
      !!lastConnectionInParentDroppableGroup.nextProposalStatusId;

    lastConnectionInParentDroppableGroup.nextProposalStatusId =
      firstConnectionStatusId;

    if (lastConnectionInParentGroupHasNext) {
      const newConnection = omit(lastConnectionInParentDroppableGroup, 'id');

      return newConnection as ProposalWorkflowConnection;
    } else {
      return lastConnectionInParentDroppableGroup;
    }
  }

  async deleteParentGroupLastConnection(
    lastConnectionInParentDroppableGroup: ProposalWorkflowConnection
  ) {
    return await this.dataSource.deleteProposalWorkflowStatus(
      lastConnectionInParentDroppableGroup.proposalStatusId,
      lastConnectionInParentDroppableGroup.proposalWorkflowId,
      lastConnectionInParentDroppableGroup.sortOrder
    );
  }

  async updateProposalWorkflowConnectionStatuses(
    proposalWorkflowConnections: ProposalWorkflowConnection[],
    {
      isInTheMiddleOfAGroup = false,
      isLastConnectionInParentGroup = false,
      isFirstConnectionInChildGroup = false,
    }
  ) {
    const updatedWorkflowConnections =
      this.orderAndConnectAllWorkflowStatusesInSameDroppableGroup(
        proposalWorkflowConnections,
        isInTheMiddleOfAGroup
      );

    const [firstConnection, secondConnection] = updatedWorkflowConnections;
    const parentDroppableGroupId = firstConnection.parentDroppableGroupId;

    if (parentDroppableGroupId) {
      const [lastConnectionInParentDroppableGroup] =
        await this.dataSource.getProposalWorkflowConnectionsById(
          proposalWorkflowConnections[0].proposalWorkflowId,
          proposalWorkflowConnections[0].prevProposalStatusId as number,
          {
            nextProposalStatusId:
              secondConnection && isFirstConnectionInChildGroup
                ? proposalWorkflowConnections[1]?.proposalStatusId
                : null,
          }
        );

      if (secondConnection && isFirstConnectionInChildGroup) {
        updatedWorkflowConnections[0].prevProposalStatusId =
          proposalWorkflowConnections[1].prevProposalStatusId;
      } else {
        updatedWorkflowConnections[0].prevProposalStatusId =
          lastConnectionInParentDroppableGroup?.proposalStatusId;
      }

      updatedWorkflowConnections[0].prevProposalStatusId =
        lastConnectionInParentDroppableGroup?.proposalStatusId;

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
            firstConnection.proposalStatusId
          );

        updatedWorkflowConnections.push(lastUpdatedOrNewInsertedConnection);
      }
    }

    if (isLastConnectionInParentGroup) {
      const lastConnection =
        updatedWorkflowConnections.pop() as ProposalWorkflowConnection;
      const secondLastConnection = updatedWorkflowConnections.slice(-1)[0];
      const findAllConnectionsByParentGroup = true;

      // Delete connection between second last and last connection if there is one.
      if (secondLastConnection) {
        const secondLastConnectionInitialSortOrder =
          proposalWorkflowConnections.find(
            (proposalWorkflowConnection) =>
              proposalWorkflowConnection.proposalStatusId ===
                secondLastConnection.proposalStatusId &&
              proposalWorkflowConnection.prevProposalStatusId ===
                secondLastConnection.prevProposalStatusId
          )?.sortOrder;

        await this.dataSource.deleteProposalWorkflowStatus(
          secondLastConnection.proposalStatusId,
          secondLastConnection.proposalWorkflowId,
          secondLastConnectionInitialSortOrder || secondLastConnection.sortOrder
        );
      }

      // Find all potential first child connections and connect them with new parent
      const allFirstChildrenGroupConnections = (
        await this.dataSource.getProposalWorkflowConnections(
          lastConnection.proposalWorkflowId,
          lastConnection.droppableGroupId,
          findAllConnectionsByParentGroup
        )
      )
        .filter((childConnection) => childConnection.sortOrder === 0)
        .map((firstChildConnection) => ({
          ...firstChildConnection,
          prevProposalStatusId: lastConnection.proposalStatusId,
        }));

      if (
        allFirstChildrenGroupConnections &&
        allFirstChildrenGroupConnections.length > 0
      ) {
        updatedWorkflowConnections.push(...allFirstChildrenGroupConnections);

        allFirstChildrenGroupConnections.forEach((firstChildConnection) => {
          updatedWorkflowConnections.push({
            ...lastConnection,
            nextProposalStatusId: firstChildConnection.proposalStatusId,
          });
        });
      }
    }

    return await this.dataSource.updateProposalWorkflowStatuses(
      updatedWorkflowConnections
    );
  }

  async insertNewAndUpdateExistingProposalWorkflowStatuses(
    args: AddProposalWorkflowStatusInput
  ) {
    const newWorkflowConnection = args as ProposalWorkflowConnection;
    const allWorkflowGroupConnections =
      await this.dataSource.getProposalWorkflowConnections(
        args.proposalWorkflowId,
        args.droppableGroupId,
        false
      );

    const isFirstConnectionInChildGroup =
      newWorkflowConnection.sortOrder === 0 &&
      !!newWorkflowConnection.prevProposalStatusId;

    const isLastConnectionInParentGroup =
      newWorkflowConnection.sortOrder === allWorkflowGroupConnections.length &&
      !!newWorkflowConnection.nextProposalStatusId;

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
      await this.updateProposalWorkflowConnectionStatuses(
        allWorkflowGroupConnections,
        {
          isInTheMiddleOfAGroup,
          isFirstConnectionInChildGroup,
          isLastConnectionInParentGroup,
        }
      )
    )[newWorkflowConnection.sortOrder];

    return insertedWorkflowConnection;
  }

  // NOTE: This is not in use currently.
  moveArrayElement(
    workflowConnections: ProposalWorkflowConnection[],
    fromIndex: number,
    toIndex: number
  ) {
    const proposalWorkflowConnectionToMove = workflowConnections[fromIndex];

    workflowConnections.splice(
      workflowConnections.indexOf(proposalWorkflowConnectionToMove),
      1
    );

    workflowConnections.splice(toIndex, 0, proposalWorkflowConnectionToMove);

    return workflowConnections;
  }

  async insertProposalWorkflowStatus(args: AddProposalWorkflowStatusInput) {
    return this.dataSource.addProposalWorkflowStatus(args);
  }

  @ValidateArgs(addProposalWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async addProposalWorkflowStatus(
    agent: UserWithRole | null,
    args: AddProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection | Rejection> {
    const isVeryFirstConnection =
      !args.nextProposalStatusId && !args.prevProposalStatusId;
    try {
      if (isVeryFirstConnection) {
        return this.insertProposalWorkflowStatus(args);
      } else {
        return this.insertNewAndUpdateExistingProposalWorkflowStatuses(args);
      }
    } catch (error) {
      return rejection(
        'Could not add proposal workflow status',
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
        args.proposalWorkflowConnectionId,
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
  @ValidateArgs(moveProposalWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async moveProposalWorkflowStatus(
    agent: UserWithRole | null,
    args: MoveProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection | Rejection> {
    try {
      const allSourceGroupWorkflowConnections =
        await this.dataSource.getProposalWorkflowConnections(
          args.proposalWorkflowId,
          args.from.droppableId
        );

      let reorderedWorkflowConnections: ProposalWorkflowConnection[] = [];

      if (args.from.droppableId === args.to.droppableId) {
        reorderedWorkflowConnections = this.moveArrayElement(
          allSourceGroupWorkflowConnections,
          args.from.index,
          args.to.index
        );
      }

      const isFirstConnectionInChildGroup = args.to.index === 0;

      await this.updateProposalWorkflowConnectionStatuses(
        reorderedWorkflowConnections,
        { isFirstConnectionInChildGroup }
      );

      return reorderedWorkflowConnections[args.to.index];
    } catch (error) {
      return rejection(
        'Could not move proposal workflow status',
        { agent, args },
        error
      );
    }
  }

  async findPreviousAndNextConnections(
    proposalWorkflowId: number,
    {
      currentConnectionId,
      previousConnectionId,
      nextConnectionId,
    }: {
      currentConnectionId: number;
      previousConnectionId: number | null;
      nextConnectionId: number | null;
    }
  ) {
    const [previousConnection] = previousConnectionId
      ? await this.dataSource.getProposalWorkflowConnectionsById(
          proposalWorkflowId,
          previousConnectionId,
          {
            nextProposalStatusId: currentConnectionId,
          }
        )
      : [];

    const [nextConnection] = nextConnectionId
      ? await this.dataSource.getProposalWorkflowConnectionsById(
          proposalWorkflowId,
          nextConnectionId,
          {
            prevProposalStatusId: currentConnectionId,
          }
        )
      : [];

    return [previousConnection, nextConnection];
  }

  @ValidateArgs(deleteProposalWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteProposalWorkflowStatus(
    agent: UserWithRole | null,
    args: DeleteProposalWorkflowStatusInput
  ): Promise<boolean | Rejection> {
    try {
      // NOTE: We can have more than one connection if it is multi-column workflow
      const workflowConnectionsToRemove =
        await this.dataSource.getProposalWorkflowConnectionsById(
          args.proposalWorkflowId,
          args.proposalStatusId,
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
        await this.dataSource.getProposalWorkflowConnections(
          args.proposalWorkflowId,
          firstWorkflowConnectionToRemove.droppableGroupId
        );

      const isLastConnectionInGroupRemoved =
        firstWorkflowConnectionToRemove.sortOrder + 1 ===
        allGroupWorkflowConnections.length;
      const lastConnectionInParentGroupRemoved =
        isLastConnectionInGroupRemoved &&
        firstWorkflowConnectionToRemove.nextProposalStatusId &&
        firstWorkflowConnectionToRemove.prevProposalStatusId;

      if (lastConnectionInParentGroupRemoved) {
        const [workflowConnectionToReplaceRemoved] =
          await this.dataSource.getProposalWorkflowConnectionsById(
            firstWorkflowConnectionToRemove.proposalWorkflowId,
            firstWorkflowConnectionToRemove.prevProposalStatusId as number,
            {}
          );

        if (!workflowConnectionToReplaceRemoved) {
          return rejection(
            'Can not delete workflow connection because connection to replace is not found',
            { firstWorkflowConnectionToRemove }
          );
        }

        workflowConnectionsToRemove.forEach(async (connection) => {
          const updatedWorkflowConnections: ProposalWorkflowConnection[] = [];

          if (connection.nextProposalStatusId) {
            const [nextConnection] =
              await this.dataSource.getProposalWorkflowConnectionsById(
                connection.proposalWorkflowId,
                connection.nextProposalStatusId as number,
                {}
              );

            if (nextConnection) {
              updatedWorkflowConnections.push({
                ...nextConnection,
                prevProposalStatusId: connection.prevProposalStatusId,
              });
            }
          }

          updatedWorkflowConnections.push({
            ...connection,
            prevProposalStatusId:
              workflowConnectionToReplaceRemoved.prevProposalStatusId,
            proposalStatusId:
              workflowConnectionToReplaceRemoved.proposalStatusId,
            sortOrder: workflowConnectionToReplaceRemoved.sortOrder,
          });

          await this.dataSource.updateProposalWorkflowStatuses(
            updatedWorkflowConnections
          );
        });

        await this.dataSource.deleteProposalWorkflowStatus(
          workflowConnectionToReplaceRemoved.proposalStatusId,
          workflowConnectionToReplaceRemoved.proposalWorkflowId,
          workflowConnectionToReplaceRemoved.sortOrder
        );
      } else {
        const result = await this.dataSource.deleteProposalWorkflowStatus(
          args.proposalStatusId,
          args.proposalWorkflowId,
          args.sortOrder
        );

        const [previousConnection, nextConnection] =
          await this.findPreviousAndNextConnections(args.proposalWorkflowId, {
            currentConnectionId: result.proposalStatusId,
            previousConnectionId: result.prevProposalStatusId,
            nextConnectionId: result.nextProposalStatusId,
          });

        const connectionsToUpdate = [];

        if (previousConnection) {
          connectionsToUpdate.push({
            ...previousConnection,
            nextProposalStatusId: result.nextProposalStatusId,
          });
        }

        if (nextConnection) {
          connectionsToUpdate.push({
            ...nextConnection,
            prevProposalStatusId: result.prevProposalStatusId,
          });
        }

        await this.dataSource.updateProposalWorkflowStatuses(
          connectionsToUpdate
        );
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
}
