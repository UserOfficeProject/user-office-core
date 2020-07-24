import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class SampleQueries {
  constructor(
    public dataSource: SampleDataSource,
    public questionaryDataSource: QuestionaryDataSource,
    private userAuth: UserAuthorization,
    private questionaryAuth: QuestionaryAuthorization
  ) {}

  async getSample(agent: UserWithRole | null, sampleId: number) {
    const sample = await this.dataSource.getSample(sampleId);
    if (this.userAuth.isUserOfficer(agent) || agent?.id === sample.creatorId) {
      return sample;
    }

    // TODO peform authorization for co-proposers
    return null;
  }

  async getSamples(agent: UserWithRole | null, args: SamplesArgs) {
    // TODO add authorization
    const samples = await this.dataSource.getSamples(args);
    return samples;
  }

  async getSamplesByAnswerId(agent: UserWithRole | null, answerId: number) {
    // TODO add authorization
    return await this.dataSource.getSamplesByAnswerId(answerId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getSamplesByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getSamplesByCallId(callId);
  }
}
