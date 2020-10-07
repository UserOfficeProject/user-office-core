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
} from '@esss-swap/duo-validation';

import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { ProposalStatus } from '../models/ProposalStatus';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import { ProposalWorkflowConnection } from '../models/ProposalWorkflowConnections';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AddProposalWorkflowStatusInput } from '../resolvers/mutations/settings/AddProposalWorkflowStatusMutation';
import { CreateProposalStatusInput } from '../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../resolvers/mutations/settings/CreateProposalWorkflowMutation';
import { DeleteProposalWorkflowStatusInput } from '../resolvers/mutations/settings/DeleteProposalWorkflowStatusMutation';
import { MoveProposalWorkflowStatusInput } from '../resolvers/mutations/settings/MoveProposalWorkflowStatusMutation';
import { UpdateProposalStatusInput } from '../resolvers/mutations/settings/UpdateProposalStatusMutation';
import { UpdateProposalWorkflowInput } from '../resolvers/mutations/settings/UpdateProposalWorkflowMutation';
import { omit } from '../utils/helperFunctions';
import { logger } from '../utils/Logger';

export default class ProposalSettingsMutations {
  constructor(private dataSource: ProposalSettingsDataSource) {}

  @ValidateArgs(createProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createProposalStatus(
    agent: UserWithRole | null,
    args: CreateProposalStatusInput
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource
      .createProposalStatus(args)
      .then(result => result)
      .catch(error => {
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
    // TODO: Find better way of preventing update and remove on default proposal statuses.
    if (args.id < 10) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .updateProposalStatus(args)
      .then(result => result)
      .catch(error => {
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
    // TODO: Find better way of preventing update and remove on default proposal statuses.
    if (args.id < 10) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .deleteProposalStatus(args.id)
      .then(result => result)
      .catch(error => {
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
    return this.dataSource
      .createProposalWorkflow(args)
      .then(result => result)
      .catch(error => {
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
    return this.dataSource
      .updateProposalWorkflow(args)
      .then(result => result)
      .catch(error => {
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
    return this.dataSource
      .deleteProposalWorkflow(args.id)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not delete proposal workflow', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  async insertProposalWorkflowStatus(args: AddProposalWorkflowStatusInput) {
    return this.dataSource
      .addProposalWorkflowStatus(args)
      .then(result => result);
  }

  orderAndConnectAllGroupWorkflowConnections(
    proposalWorkflowConnections: ProposalWorkflowConnection[]
  ) {
    return proposalWorkflowConnections.map((workflowConnection, index) => {
      return {
        ...workflowConnection,
        sortOrder: index,
        prevProposalStatusId: proposalWorkflowConnections[index - 1]
          ? proposalWorkflowConnections[index - 1].proposalStatusId
          : null,
        nextProposalStatusId: proposalWorkflowConnections[index + 1]
          ? proposalWorkflowConnections[index + 1].proposalStatusId
          : null,
      };
    });
  }

  async getLastConnectionInParentDroppableGroup(
    proposalWorkflowId: number,
    parentDroppableGroupId: string
  ) {
    return (
      await this.dataSource.getProposalWorkflowConnections(
        proposalWorkflowId,
        parentDroppableGroupId,
        false
      )
    ).pop() as ProposalWorkflowConnection;
  }

  // TODO: Clean this function a bit!
  async updateProposalWorkflowConnectionStatuses(
    proposalWorkflowConnections: ProposalWorkflowConnection[],
    isFirstConnectionInChildGroup: boolean,
    isLastConnectionInParentGroup: boolean = false
  ) {
    const updatedWorkflowConnections = this.orderAndConnectAllGroupWorkflowConnections(
      proposalWorkflowConnections
    );

    const [firstConnection, secondConnection] = updatedWorkflowConnections;
    const parentDroppableGroupId = firstConnection.parentDroppableGroupId;

    if (parentDroppableGroupId) {
      const lastConnectionInPreviousDroppableGroup = await this.getLastConnectionInParentDroppableGroup(
        firstConnection.proposalWorkflowId,
        parentDroppableGroupId
      );

      updatedWorkflowConnections[0].prevProposalStatusId =
        lastConnectionInPreviousDroppableGroup.proposalStatusId;

      const lastConnectionInPreviousGroupHasNext = !!lastConnectionInPreviousDroppableGroup.nextProposalStatusId;

      if (isFirstConnectionInChildGroup) {
        if (secondConnection) {
          await this.dataSource.deleteProposalWorkflowStatus(
            firstConnection.prevProposalStatusId as number,
            firstConnection.proposalWorkflowId,
            secondConnection.proposalStatusId
          );
        }

        lastConnectionInPreviousDroppableGroup.nextProposalStatusId =
          firstConnection.proposalStatusId;
        if (lastConnectionInPreviousGroupHasNext) {
          const newStatus = omit(lastConnectionInPreviousDroppableGroup, 'id');

          updatedWorkflowConnections.push(
            newStatus as ProposalWorkflowConnection
          );
        } else {
          updatedWorkflowConnections.push(
            lastConnectionInPreviousDroppableGroup
          );
        }
      }
    }

    if (isLastConnectionInParentGroup) {
      const lastConnection = updatedWorkflowConnections.pop() as ProposalWorkflowConnection;
      const findAllConnectionsByParentGroup = true;

      await this.dataSource.deleteProposalWorkflowStatus(
        updatedWorkflowConnections[updatedWorkflowConnections.length - 1]
          .proposalStatusId,
        updatedWorkflowConnections[updatedWorkflowConnections.length - 1]
          .proposalWorkflowId
      );

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

        for (
          let index = 0;
          index < allFirstChildrenGroupConnections.length;
          index++
        ) {
          updatedWorkflowConnections.push({
            ...lastConnection,
            nextProposalStatusId:
              allFirstChildrenGroupConnections[index].proposalStatusId,
          });
        }
      }
    }

    return await this.dataSource.updateProposalWorkflowStatuses(
      updatedWorkflowConnections
    );
  }

  // TODO: Clean this function a bit!
  async insertNewAndUpdateExistingProposalWorkflowStatuses(
    args: AddProposalWorkflowStatusInput
  ) {
    const newWorkflowConnection = {
      ...args,
    } as ProposalWorkflowConnection;
    const allWorkflowGroupConnections = await this.dataSource.getProposalWorkflowConnections(
      args.proposalWorkflowId,
      args.droppableGroupId,
      false
    );

    const lastConnectionInParentGroup =
      newWorkflowConnection.sortOrder === allWorkflowGroupConnections.length &&
      !!newWorkflowConnection.nextProposalStatusId;

    allWorkflowGroupConnections.splice(
      newWorkflowConnection.sortOrder,
      0,
      newWorkflowConnection
    );

    const isFirstConnectionInChildGroup =
      newWorkflowConnection.sortOrder === 0 &&
      !!newWorkflowConnection.prevProposalStatusId;

    const insertedWorkflowConnection = (
      await this.updateProposalWorkflowConnectionStatuses(
        allWorkflowGroupConnections,
        isFirstConnectionInChildGroup,
        lastConnectionInParentGroup
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

  // TODO: Clean this as well!
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
        const connectionsLeftInTheGroup =
          allGroupWorkflowConnections.length > 0;

        if (connectionsLeftInTheGroup) {
          await this.updateProposalWorkflowConnectionStatuses(
            allGroupWorkflowConnections,
            isFirstConnectionInGroup
          );
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
