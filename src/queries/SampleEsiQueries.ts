import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleEsiDataSource } from '../datasources/SampleEsiDataSource';
import { Authorized } from '../decorators';
import { Questionary } from '../models/Questionary';
import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { UserWithRole } from '../models/User';
import { SampleEsiArgs } from '../resolvers/queries/SampleEsiQuery';

export interface GetSampleEsisFilter {
  esiId?: number;
  sampleId?: number;
}

@injectable()
export default class SampleEsiQueries {
  constructor(
    @inject(Tokens.SampleEsiDataSource)
    public dataSource: SampleEsiDataSource,

    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource
  ) {}

  @Authorized()
  async getSampleEsi(
    user: UserWithRole | null,
    args: SampleEsiArgs
  ): Promise<SampleExperimentSafetyInput | null> {
    const esi = await this.dataSource.getSampleEsi(args);

    return this.hasReadRights(user, esi) ? esi : null;
  }

  @Authorized()
  async getSampleEsis(
    user: UserWithRole | null,
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]> {
    const esis = await this.dataSource.getSampleEsis(filter);
    const accessibleEsis: SampleExperimentSafetyInput[] = esis
      .map((esi) => (this.hasReadRights(user, esi) ? esi : null))
      .filter((esi) => esi !== null) as SampleExperimentSafetyInput[];

    return accessibleEsis;
  }

  @Authorized()
  async getQuestionary(
    user: UserWithRole | null,
    questionaryId: number
  ): Promise<Questionary> {
    const questionary = await this.questionaryDataSource.getQuestionary(
      questionaryId
    );
    if (!questionary) {
      throw new Error(
        'Unexpected error. ESI must have a questionary, but not found'
      );
    }

    return questionary;
  }

  private hasReadRights(
    user: UserWithRole | null,
    esi: SampleExperimentSafetyInput | null
  ) {
    // TODO implement authorizer
    return true;
  }
}
