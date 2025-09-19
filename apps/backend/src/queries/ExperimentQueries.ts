import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ExperimentSampleArgs } from '../resolvers/queries/ExperimentSampleQuery';
import { ExperimentsFilter } from '../resolvers/queries/ExperimentsQuery';
import { Experiment } from '../resolvers/types/Experiment';
import { ExperimentHasSample } from '../resolvers/types/ExperimentHasSample';
import { ExperimentSafety } from '../resolvers/types/ExperimentSafety';

@injectable()
export default class ExperimentQueries {
  constructor(
    @inject(Tokens.ExperimentDataSource)
    public dataSource: ExperimentDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.InstrumentDataSource)
    private instrumentDataSource: InstrumentDataSource
  ) {}

  @Authorized([
    Roles.USER_OFFICER,
    Roles.USER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.EXPERIMENT_SAFETY_REVIEWER,
  ])
  async getExperimentSafetyByExperimentPk(
    agent: UserWithRole | null,
    experimentPk: number
  ): Promise<ExperimentSafety | null> {
    const experimentSafety =
      await this.dataSource.getExperimentSafetyByExperimentPk(experimentPk);

    return experimentSafety;
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.USER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.EXPERIMENT_SAFETY_REVIEWER,
  ])
  async getExperimentSafety(
    agent: UserWithRole | null,
    experimentSafetyPk: number
  ): Promise<ExperimentSafety | null> {
    const experimentSafety =
      await this.dataSource.getExperimentSafety(experimentSafetyPk);

    return experimentSafety;
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.USER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.EXPERIMENT_SAFETY_REVIEWER,
  ])
  async getExperimentSample(
    agent: UserWithRole | null,
    args: ExperimentSampleArgs
  ): Promise<ExperimentHasSample | null> {
    const experimentSample = await this.dataSource.getExperimentSample(
      args.experimentPk,
      args.sampleId
    );

    return experimentSample;
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.USER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.EXPERIMENT_SAFETY_REVIEWER,
  ])
  async getExperimentSamples(
    agent: UserWithRole | null,
    experimentPk: number
  ): Promise<ExperimentHasSample[]> {
    const experimentSamples =
      await this.dataSource.getExperimentSamples(experimentPk);

    return experimentSamples;
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.EXPERIMENT_SAFETY_REVIEWER,
  ])
  async getExperiments(
    agent: UserWithRole | null,
    filter: ExperimentsFilter = {},
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ) {
    let instrumentScientistUserId: number | undefined;
    if (this.userAuth.isInstrumentScientist(agent)) {
      instrumentScientistUserId = agent!.id;
    }

    filter['instrumentScientistUserId'] = instrumentScientistUserId;

    return this.dataSource.getExperiments(
      filter,
      first,
      offset,
      sortField,
      sortDirection,
      searchText
    );
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.INSTRUMENT_SCIENTIST,
    Roles.EXPERIMENT_SAFETY_REVIEWER,
  ])
  async getExperiment(
    agent: UserWithRole | null,
    experimentPk: number
  ): Promise<Experiment | null> {
    return this.dataSource.getExperiment(experimentPk);
  }
}
