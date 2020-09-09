import { ProposalStatusDataSource } from '../datasources/ProposalStatusDataSource';
import { Authorized } from '../decorators';
import { ProposalStatus } from '../models/ProposalStatus';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { CreateProposalStatusArgs } from '../resolvers/mutations/CreateProposalStatusMutation';
import { UpdateProposalStatusArgs } from '../resolvers/mutations/UpdateProposalStatusMutation';
import { logger } from '../utils/Logger';

// TODO: Set up input validation for create, update and delete.

export default class ProposalStatusMutations {
  constructor(private dataSource: ProposalStatusDataSource) {}

  // @ValidateArgs(createProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    args: CreateProposalStatusArgs
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource
      .create(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not create proposalStatus', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  // @ValidateArgs(updateProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: UpdateProposalStatusArgs
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource
      .update(args)
      .then(result => result)
      .catch(error => {
        logger.logException('Could not update proposalStatus', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  // @ValidateArgs(deleteProposalStatusValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<ProposalStatus | Rejection> {
    return this.dataSource
      .delete(args.id)
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
