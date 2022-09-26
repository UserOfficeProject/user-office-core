import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalEsdDataSource } from '../datasources/ProposalEsdDataSource';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { Authorized } from '../decorators';
import { Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { User, UserWithRole } from '../models/User';
import { CreateEsdArgs } from '../resolvers/mutations/CreateEsdMutation';
import { UpdateEsdArgs } from '../resolvers/mutations/UpdateEsdMutation';
import { ExperimentSafetyDocument } from './../resolvers/types/ExperimentSafetyDocument';

@injectable()
export default class ProposalEsiMutations {
  constructor(
    @inject(Tokens.ProposalEsdDataSource)
    private esdDataSource: ProposalEsdDataSource,
    @inject(Tokens.ProposalEsiDataSource)
    private esiDataSource: ProposalEsiDataSource
  ) {}

  @Authorized([Roles.SAFETY_REVIEWER, Roles.USER_OFFICER])
  async createEsd(
    user: UserWithRole | null,
    args: CreateEsdArgs
  ): Promise<ExperimentSafetyDocument | Rejection> {
    const esi = await this.esiDataSource.getEsi(args.esiId);

    if (!esi) {
      throw new Error('ESI does not exist');
    }

    return this.esdDataSource.createEsd({
      ...args,
      reviewerUserId: (user as User).id,
    });
  }

  @Authorized()
  async updateEsd(
    user: UserWithRole | null,
    args: UpdateEsdArgs
  ): Promise<ExperimentSafetyDocument | Rejection> {
    return this.esdDataSource.updateEsd({
      ...args,
      reviewerUserId: (user as User).id,
    });
  }
}
