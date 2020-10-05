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

  async updateProposalWorkflowStatuses(
    proposalWorkflowConnections: ProposalWorkflowConnection[],
    newConnectionSortOrder: number
  ) {
    const newWorkflowConnections = proposalWorkflowConnections.map(
      (workflowConnection, index) => {
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
      }
    );

    const [firstElementInGroup] = newWorkflowConnections;
    const parentDroppableGroupId = firstElementInGroup.parentDroppableGroupId;

    if (parentDroppableGroupId) {
      const lastConnectionInPreviousGroup = (
        await this.dataSource.getProposalWorkflowConnections(
          firstElementInGroup.proposalWorkflowId,
          parentDroppableGroupId
        )
      ).pop() as ProposalWorkflowConnection;

      newWorkflowConnections[0].prevProposalStatusId =
        lastConnectionInPreviousGroup.proposalStatusId;

      if (newConnectionSortOrder === 0) {
        if (lastConnectionInPreviousGroup.nextProposalStatusId) {
          const newStatus = omit(
            {
              ...lastConnectionInPreviousGroup,
              nextProposalStatusId:
                newWorkflowConnections[newWorkflowConnections.length - 1]
                  .proposalStatusId,
            },
            'id'
          );

          newWorkflowConnections.push(lastConnectionInPreviousGroup);
          newWorkflowConnections.push(newStatus as ProposalWorkflowConnection);
        } else {
          lastConnectionInPreviousGroup.nextProposalStatusId =
            newWorkflowConnections[
              newWorkflowConnections.length - 1
            ].proposalStatusId;

          newWorkflowConnections.push(lastConnectionInPreviousGroup);
        }
      }
    }

    return await this.dataSource.updateProposalWorkflowStatuses(
      newWorkflowConnections
    );
  }

  async insertNewAndUpdateExistingProposalWorkflowStatuses(
    args: AddProposalWorkflowStatusInput
  ) {
    const newWorkflowConnection = {
      ...args,
    } as ProposalWorkflowConnection;
    const allWorkflowGroupConnections = await this.dataSource.getProposalWorkflowConnections(
      args.proposalWorkflowId,
      args.droppableGroupId
    );

    allWorkflowGroupConnections.splice(
      newWorkflowConnection.sortOrder,
      0,
      newWorkflowConnection
    );

    const insertedWorkflowConnection = (
      await this.updateProposalWorkflowStatuses(
        allWorkflowGroupConnections,
        newWorkflowConnection.sortOrder
      )
    )[newWorkflowConnection.sortOrder];

    return insertedWorkflowConnection;
  }

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

  @ValidateArgs(moveProposalWorkflowStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async moveProposalWorkflowStatus(
    agent: UserWithRole | null,
    args: MoveProposalWorkflowStatusInput
  ): Promise<ProposalWorkflowConnection | Rejection> {
    try {
      const allWorkflowConnections = await this.dataSource.getProposalWorkflowConnections(
        args.proposalWorkflowId
      );

      const reorderedWorkflowConnections = this.moveArrayElement(
        allWorkflowConnections,
        args.from,
        args.to
      );

      // await this.updateProposalWorkflowStatuses(reorderedWorkflowConnections);

      return reorderedWorkflowConnections[args.to];
    } catch (error) {
      logger.logException('Could not add proposal workflow status', error, {
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
        const allWorkflowConnections = await this.dataSource.getProposalWorkflowConnections(
          args.proposalWorkflowId
        );

        // await this.updateProposalWorkflowStatuses(allWorkflowConnections);

        return result;
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
