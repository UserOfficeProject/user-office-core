import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { Sample } from '../models/Sample';
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
  @Authorized([Roles.USER_OFFICER])
  async getSamples(
    agent: UserWithRole | null,
    args: SamplesArgs
  ): Promise<Sample[]> {
    return await this.dataSource.getSamples(args);
  }

  async getSamplesByAnswerId(
    agent: UserWithRole | null,
    answerId: number
  ): Promise<Sample[]> {
    // TODO add authorization
    return await this.dataSource.getSamplesByAnswerId(answerId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getSamplesByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getSamplesByCallId(callId);
  }
}
