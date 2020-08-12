import { sampleDataSource } from '../datasources';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';
import { logger } from '../utils/Logger';
import { questionaryAuthorization } from '../utils/QuestionaryAuthorization';
import { sampleAuthorization } from '../utils/SampleAuthorization';

export default class SampleQueries {
  constructor(
    public dataSource: SampleDataSource,
    public questionaryDataSource: QuestionaryDataSource
  ) {}

  async getSample(agent: UserWithRole | null, sampleId: number) {
    if (!sampleAuthorization.hasWriteRights(agent, sampleId)) {
      logger.logWarn('Unauthorized getSample access', { agent, sampleId });

      return null;
    }

    return sampleDataSource.getSample(sampleId);
  }

  async getSamples(agent: UserWithRole | null, args: SamplesArgs) {
    let samples = await this.dataSource.getSamples(args);

    samples = await Promise.all(
      samples.map(sample => sampleAuthorization.hasReadRights(agent, sample.id))
    ).then(results => samples.filter((_v, index) => results[index]));

    return samples;
  }

  async getSamplesByAnswerId(agent: UserWithRole | null, answerId: number) {
    const answer = await this.questionaryDataSource.getAnswer(answerId);
    if (!questionaryAuthorization.hasReadRights(agent, answer.questionaryId)) {
      logger.logWarn('Unauthorized getSamplesByAnswerId access', {
        agent,
        answerId,
      });

      return null;
    }

    return await this.dataSource.getSamplesByAnswerId(answerId);
  }

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  async getSamplesByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getSamplesByCallId(callId);
  }
}
