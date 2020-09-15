import {
  createProposalStatusValidationSchema,
  updateProposalStatusValidationSchema,
  deleteProposalStatusValidationSchema,
} from '@esss-swap/duo-validation';

import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { Authorized, ValidateArgs } from '../decorators';
import { ProposalStatus } from '../models/ProposalStatus';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateProposalStatusArgs } from '../resolvers/mutations/CreateProposalStatusMutation';
import { UpdateProposalStatusArgs } from '../resolvers/mutations/UpdateProposalStatusMutation';
import { logger } from '../utils/Logger';

export default class ProposalSettingsMutations {
  constructor(private dataSource: ProposalSettingsDataSource) {}

  @ValidateArgs(createProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async createProposalStatus(
    agent: UserWithRole | null,
    args: CreateProposalStatusArgs
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource
      .createProposalStatus(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not create proposalStatus', error, {
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
    args: UpdateProposalStatusArgs
  ): Promise<ProposalStatus | Rejection> {
    // TODO: Find better way of preventing update and remove on default proposal statuses.
    if (args.id < 10) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .updateProposalStatus(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not update proposalStatus', error, {
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
        logger.logException('Could not delete proposalStatus', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }
}
