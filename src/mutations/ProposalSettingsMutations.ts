import {
  createProposalStatusValidationSchema,
  updateProposalStatusValidationSchema,
  deleteProposalStatusValidationSchema,
} from '@esss-swap/duo-validation';

import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { ProposalStatus } from '../models/ProposalStatus';
import { ProposalWorkflow } from '../models/ProposalWorkflow';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateProposalStatusInput } from '../resolvers/mutations/settings/CreateProposalStatusMutation';
import { CreateProposalWorkflowInput } from '../resolvers/mutations/settings/CreateProposalWorkflowMutation';
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

  // @ValidateArgs(createProposalWrorkflowValidationSchema)
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

  // @ValidateArgs(updateProposalWorkflowValidationSchema)
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

  // @ValidateArgs(deleteProposalWorkflowValidationSchema)
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
}
