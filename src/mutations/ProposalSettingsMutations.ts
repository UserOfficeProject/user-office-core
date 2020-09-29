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

  async updateLastAndInsertNewProposalStatusAtTheEnd(
    args: AddProposalWorkflowStatusInput
  ) {
    const previousLastConnection = await this.dataSource.getProposalWorkflowConnection(
      args.proposalWorkflowId,
      args.prevProposalStatusId as number
    );

    if (previousLastConnection) {
      this.dataSource.updateProposalWorkflowStatuses([
        {
          ...previousLastConnection,
          nextProposalStatusId: args.proposalStatusId,
        },
      ]);
    }

    return this.insertProposalWorkflowStatus(args);
  }

  async updateAllProposalWorkflowStatuses(
    allWorkflowConnections: ProposalWorkflowConnection[]
  ) {
    if (allWorkflowConnections.length > 0) {
      const newWorkflowConnections = allWorkflowConnections.map(
        (workflowConnection, index) => {
          return {
            ...workflowConnection,
            sortOrder: index,
            prevProposalStatusId: allWorkflowConnections[index - 1]
              ? allWorkflowConnections[index - 1].proposalStatusId
              : null,
            nextProposalStatusId: allWorkflowConnections[index + 1]
              ? allWorkflowConnections[index + 1].proposalStatusId
              : null,
          };
        }
      );

      await this.dataSource.updateProposalWorkflowStatuses(
        newWorkflowConnections
      );
    }
  }

  async insertNewAndUpdateExistingProposalWorkflowStatuses(
    args: AddProposalWorkflowStatusInput
  ) {
    // TODO: This can be optimized even more with batch upsert. We get all connections inject new one on the right place and just do the upsert (insert or update).
    const allWorkflowConnections = await this.dataSource.getProposalWorkflowConnections(
      args.proposalWorkflowId
    );
    const newConnection = await this.insertProposalWorkflowStatus(args);

    allWorkflowConnections.splice(newConnection.sortOrder, 0, newConnection);

    await this.updateAllProposalWorkflowStatuses(allWorkflowConnections);

    return newConnection;
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
    const isConnectionAtTheEnd =
      !args.nextProposalStatusId && !!args.prevProposalStatusId;
    try {
      if (isVeryFirstConnection) {
        return this.insertProposalWorkflowStatus(args);
      } else if (isConnectionAtTheEnd) {
        return this.updateLastAndInsertNewProposalStatusAtTheEnd(args);
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

      await this.updateAllProposalWorkflowStatuses(
        reorderedWorkflowConnections
      );

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

        await this.updateAllProposalWorkflowStatuses(allWorkflowConnections);

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
