import { logger } from '@esss-swap/duo-logger';
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
  addNextStatusEventsValidationSchema,
} from '@esss-swap/duo-validation';

import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { NextStatusEvent } from '../models/NextStatusEvent';
import { ProposalStatus } from '../models/ProposalStatus';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import { ProposalWorkflowConnection } from '../models/ProposalWorkflowConnections';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AddNextStatusEventsToConnectionInput } from '../resolvers/mutations/settings/AddNextStatusEventsToConnection';
import { AddProposalWorkflowStatusInput } from '../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { DeleteProposalWorkflowStatusInput } from '../resolvers/mutations/settings/DeleteProposalWorkflowStatusMutation';
import { MoveProposalWorkflowStatusInput } from '../resolvers/mutations/settings/MoveProposalWorkflowStatusMutation';
import { UpdateProposalStatusInput } from '../resolvers/mutations/settings/UpdateProposalStatusMutation';
import { UpdateProposalWorkflowInput } from '../resolvers/mutations/settings/UpdateProposalWorkflowMutation';
import { omit } from '../utils/helperFunctions';

export default class ProposalSettingsMutations {
  constructor(private dataSource: ProposalSettingsDataSource) {}

  @ValidateArgs(createProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createProposalStatus(
    agent: UserWithRole | null,
    args: CreateProposalStatusInput
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource.createProposalStatus(args).catch(error => {
      logger.logException('Could not create proposal status', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
    });
  }

  @ValidateArgs(updateProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateProposalStatus(
    agent: UserWithRole | null,
    args: UpdateProposalStatusInput
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource.updateProposalStatus(args).catch(error => {
      logger.logException('Could not update proposal status', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
    });
  }

  @ValidateArgs(deleteProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteProposalStatus(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource.deleteProposalStatus(args.id).catch(error => {
      logger.logException('Could not delete proposal status', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
    });
  }

  @ValidateArgs(createProposalWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createProposalWorkflow(
    agent: UserWithRole | null,
    args: CreateProposalWorkflowInput
  ): Promise<ProposalWorkflow | Rejection> {
    return this.dataSource.createProposalWorkflow(args).catch(error => {
      logger.logException('Could not create proposal workflow', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
    });
  }

  @ValidateArgs(updateProposalWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async updateProposalWorkflow(
    agent: UserWithRole | null,
    args: UpdateProposalWorkflowInput
  ): Promise<ProposalWorkflow | Rejection> {
    return this.dataSource.updateProposalWorkflow(args).catch(error => {
      logger.logException('Could not update proposal workflow', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
    });
  }

  @ValidateArgs(deleteProposalWorkflowValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteProposalWorkflow(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<ProposalWorkflow | Rejection> {
    return this.dataSource.deleteProposalWorkflow(args.id).catch(error => {
      logger.logException('Could not delete proposal workflow', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
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
    const lastConnectionInParentGroupHasNext = !!lastConnectionInParentDroppableGroup.nextProposalStatusId;

    lastConnectionInParentDroppableGroup.nextProposalStatusId = firstConnectionStatusId;

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
      lastConnectionInParentDroppableGroup.nextProposalStatusId as number
    );
  }

  async updateProposalWorkflowConnectionStatuses(
    proposalWorkflowConnections: ProposalWorkflowConnection[],
    isFirstConnectionInChildGroup: boolean,
    isLastConnectionInParentGroup: boolean = false,
    isInTheMiddleOfAGroup: boolean = false
  ) {
    const updatedWorkflowConnections = this.orderAndConnectAllWorkflowStatusesInSameDroppableGroup(
      proposalWorkflowConnections,
      isInTheMiddleOfAGroup
    );

    const [firstConnection, secondConnection] = updatedWorkflowConnections;
    const parentDroppableGroupId = firstConnection.parentDroppableGroupId;

    if (parentDroppableGroupId) {
      const lastConnectionInParentDroppableGroup = await this.getLastConnectionInParentDroppableGroup(
        firstConnection.proposalWorkflowId,
        parentDroppableGroupId
      );

      updatedWorkflowConnections[0].prevProposalStatusId =
        lastConnectionInParentDroppableGroup.proposalStatusId;

      if (isFirstConnectionInChildGroup) {
        if (secondConnection) {
          // Remove connection if there was one between parent group last status and this group second status because now we have new status in between.
          await this.deleteParentGroupLastConnection(
            lastConnectionInParentDroppableGroup
          );
        }

        // If last connection already has next we add new connection. If not we update the existing one with next of the current group first connection.
        const lastUpdatedOrNewInsertedConnection = this.getNewOrUpdatedLastConnectionInParentGroup(
          lastConnectionInParentDroppableGroup,
          firstConnection.proposalStatusId
        );

        updatedWorkflowConnections.push(lastUpdatedOrNewInsertedConnection);
      }
    }

    if (isLastConnectionInParentGroup) {
      const lastConnection = updatedWorkflowConnections.pop() as ProposalWorkflowConnection;
      const secondLastConnection = updatedWorkflowConnections.slice(-1)[0];
      const findAllConnectionsByParentGroup = true;

      // Delete connection between second last and last connection if there is one.
      if (secondLastConnection) {
        await this.dataSource.deleteProposalWorkflowStatus(
          secondLastConnection.proposalStatusId,
          secondLastConnection.proposalWorkflowId
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
        .filter(childConnection => childConnection.sortOrder === 0)
        .map(firstChildConnection => ({
          ...firstChildConnection,
          prevProposalStatusId: lastConnection.proposalStatusId,
        }));

      if (
        allFirstChildrenGroupConnections &&
        allFirstChildrenGroupConnections.length > 0
      ) {
        updatedWorkflowConnections.push(...allFirstChildrenGroupConnections);

        allFirstChildrenGroupConnections.forEach(firstChildConnection => {
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
    const allWorkflowGroupConnections = await this.dataSource.getProposalWorkflowConnections(
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
        isFirstConnectionInChildGroup,
        isLastConnectionInParentGroup,
        isInTheMiddleOfAGroup
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
      logger.logException('Could not add proposal workflow status', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
    }
  }

  @ValidateArgs(addNextStatusEventsValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async addNextStatusEventsToConnection(
    agent: UserWithRole | null,
    args: AddNextStatusEventsToConnectionInput
  ): Promise<NextStatusEvent[] | Rejection> {
    return this.dataSource
      .addNextStatusEventsToConnection(
        args.proposalWorkflowConnectionId,
        args.nextStatusEvents
      )
      .catch(error => {
        logger.logException('Could not add next status events', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
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
      const allSourceGroupWorkflowConnections = await this.dataSource.getProposalWorkflowConnections(
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

      const isFirstConnectionInGroup = args.to.index === 0;

      await this.updateProposalWorkflowConnectionStatuses(
        reorderedWorkflowConnections,
        isFirstConnectionInGroup
      );

      return reorderedWorkflowConnections[args.to.index];
    } catch (error) {
      logger.logException('Could not move proposal workflow status', error, {
        agent,
        args,
      });

      return rejection('INTERNAL_ERROR');
    }
  }

  @ValidateArgs(deleteProposalWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async deleteProposalWorkflowStatus(
    agent: UserWithRole | null,
    args: DeleteProposalWorkflowStatusInput
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .deleteProposalWorkflowStatus(
        args.proposalStatusId,
        args.proposalWorkflowId
      )
      .then(async result => {
        const allGroupWorkflowConnections = await this.dataSource.getProposalWorkflowConnections(
          args.proposalWorkflowId,
          result.droppableGroupId
        );

        const isFirstConnectionInGroup = result.sortOrder === 0;
        const isLastConnectionInGroupRemoved =
          result.sortOrder === allGroupWorkflowConnections.length;
        const connectionsLeftInTheGroup =
          allGroupWorkflowConnections.length > 0;

        if (connectionsLeftInTheGroup) {
          if (isLastConnectionInGroupRemoved && result.nextProposalStatusId) {
            await this.dataSource.deleteProposalWorkflowStatus(
              result.prevProposalStatusId as number,
              result.proposalWorkflowId,
              result.proposalStatusId
            );

            const newLastParentConnection =
              allGroupWorkflowConnections[
                allGroupWorkflowConnections.length - 1
              ];

            if (newLastParentConnection) {
              await this.insertNewAndUpdateExistingProposalWorkflowStatuses(
                omit(newLastParentConnection, 'id')
              );
            }
          } else if (!result.nextProposalStatusId) {
            await this.updateProposalWorkflowConnectionStatuses(
              allGroupWorkflowConnections,
              false,
              false,
              false
            );
          }

          if (
            isFirstConnectionInGroup &&
            result.prevProposalStatusId &&
            result.nextProposalStatusId
          ) {
            await this.dataSource.deleteProposalWorkflowStatus(
              result.prevProposalStatusId as number,
              result.proposalWorkflowId,
              result.proposalStatusId
            );
          }
        } else {
          if (result.parentDroppableGroupId) {
            const lastConnectionInPreviousDroppableGroup = await this.getLastConnectionInParentDroppableGroup(
              result.proposalWorkflowId,
              result.parentDroppableGroupId as string
            );
            lastConnectionInPreviousDroppableGroup.nextProposalStatusId = null;
            await this.dataSource.updateProposalWorkflowStatuses([
              lastConnectionInPreviousDroppableGroup,
            ]);
          }
        }

        return true;
      })
      .catch(error => {
        logger.logException(
          'Could not delete proposal workflow status',
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
