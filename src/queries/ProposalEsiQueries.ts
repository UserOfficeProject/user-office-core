import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { Authorized } from '../decorators';
import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { Questionary } from '../models/Questionary';
import { UserWithRole } from '../models/User';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';

export interface GetProposalEsisFilter {
  scheduledEventId?: number;
  questionaryId?: number;
}

@injectable()
export default class ProposalEsiQueries {
  constructor(
    @inject(Tokens.ProposalEsiDataSource)
    public dataSource: ProposalEsiDataSource,

    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource
  ) {}

  @Authorized()
  async getEsi(
    user: UserWithRole | null,
    id: number
  ): Promise<ExperimentSafetyInput | null> {
    const esi = await this.dataSource.getEsi(id);

    return this.hasReadRights(user, esi) ? esi : null;
  }

  @Authorized()
  async getEsis(
    user: UserWithRole | null,
    filter: GetProposalEsisFilter
  ): Promise<ExperimentSafetyInput[] | null> {
    const esis = await this.dataSource.getEsis(filter);

    const accessibleEsis: ExperimentSafetyInput[] = esis
      .map((esi) => (this.hasReadRights(user, esi) ? esi : null))
      .filter((esi) => esi !== null) as ExperimentSafetyInput[];

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
    esi: ExperimentSafetyInput | null
  ) {
    // TODO implement authorizer
    return true;
  }
}
