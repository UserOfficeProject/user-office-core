import { SampleDataSource } from '../datasources/SampleDataSource';
import { Authorized } from '../decorators';
import { Sample } from '../models/Sample';
import { UserWithRole } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';
import { SamplesArgs } from '../resolvers/queries/SamplesQuery';

export default class SampleQueries {
  constructor(
    public dataSource: SampleDataSource,
    private userAuth: UserAuthorization
  ) {}
  @Authorized()
  async getSamples(
    agent: UserWithRole | null,
    args: SamplesArgs
  ): Promise<Sample[]> {
    // TODO perform authorization
    return await this.dataSource.getSamples(args);
  }
}
