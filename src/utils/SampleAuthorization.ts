import { sampleDataSource, questionaryDataSource } from '../datasources';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { UserWithRole } from '../models/User';
import { userAuthorization } from '../utils/UserAuthorization';
import { questionaryAuthorization } from './QuestionaryAuthorization';

export class SampleAuthorization {
  constructor(
    private sampleDataSource: SampleDataSource,
    private questionaryDataSource: QuestionaryDataSource
  ) {}

  async hasReadRights(agent: UserWithRole | null, sampleId: number) {
    if (await userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const sample = await this.sampleDataSource.getSample(sampleId);
    if (sample.creatorId === agent?.id) {
      return true;
    }

    const proposalQuestionary = await this.questionaryDataSource.getParentQuestionary(
      sample.questionaryId
    );
    if (proposalQuestionary?.questionaryId === undefined) {
      return false;
    }

    return questionaryAuthorization.hasReadRights(
      agent,
      proposalQuestionary.questionaryId
    );
  }

  async hasWriteRights(agent: UserWithRole | null, sampleId: number) {
    if (await userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const sample = await this.sampleDataSource.getSample(sampleId);
    if (sample.creatorId === agent?.id) {
      return true;
    }

    const proposalQuestionary = await this.questionaryDataSource.getParentQuestionary(
      sample.questionaryId
    );
    if (!proposalQuestionary?.questionaryId) {
      return false;
    }

    return questionaryAuthorization.hasWriteRights(
      agent,
      proposalQuestionary.questionaryId
    );
  }
}

export const sampleAuthorization = new SampleAuthorization(
  sampleDataSource,
  questionaryDataSource
);
