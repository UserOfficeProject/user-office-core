import { inject, injectable } from 'tsyringe';
import { Authorized } from 'type-graphql';

import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ExperimentSafety } from '../resolvers/types/Experiment';

@injectable()
export default class ExperimentQueries {
  constructor(
    @inject(Tokens.ExperimentDataSource) public dataSource: ExperimentDataSource
  ) {}

  @Authorized(Roles.USER)
  async getExperimentSafetyByExperimentPk(
    user: UserWithRole | null,
    experimentPk: number
  ): Promise<ExperimentSafety | null> {
    const experimentSafety =
      await this.dataSource.getExperimentSafetyByExperimentPk(experimentPk);

    return experimentSafety;
  }
}
