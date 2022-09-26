import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalEsdDataSource } from '../datasources/ProposalEsdDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ExperimentSafetyDocument } from './../resolvers/types/ExperimentSafetyDocument';

@injectable()
export default class ProposalEsdQueries {
  constructor(
    @inject(Tokens.ProposalEsdDataSource)
    private dataSource: ProposalEsdDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER, Roles.SAFETY_REVIEWER])
  async getEsd(
    user: UserWithRole | null,
    id: number
  ): Promise<ExperimentSafetyDocument | null> {
    return this.dataSource.getEsd(id);
  }
}
