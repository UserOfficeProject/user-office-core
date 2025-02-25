import { inject, injectable } from 'tsyringe';
import { Authorized } from 'type-graphql';

import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ExperimentSampleArgs } from '../resolvers/queries/ExperimentSampleQuery';
import { ExperimentHasSample } from '../resolvers/types/ExperimentHasSample';
import { ExperimentSafety } from '../resolvers/types/ExperimentSafety';

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

  @Authorized(Roles.USER)
  async getExperimentSafety(
    user: UserWithRole | null,
    experimentSafetyPk: number
  ): Promise<ExperimentSafety | null> {
    const experimentSafety =
      await this.dataSource.getExperimentSafety(experimentSafetyPk);

    return experimentSafety;
  }

  @Authorized(Roles.USER)
  async getExperimentSample(
    user: UserWithRole | null,
    args: ExperimentSampleArgs
  ): Promise<ExperimentHasSample | null> {
    const experimentSample = await this.dataSource.getExperimentSample(
      args.experimentPk,
      args.sampleId
    );

    return experimentSample;
  }
}
