import { sampleDataSource } from '../datasources';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { UserWithRole } from '../models/User';
import { userAuthorization } from '../utils/UserAuthorization';

export class SampleAuthorization {
  constructor(private sampleDataSource: SampleDataSource) {}

  async hasReadRights(
    agent: UserWithRole | null,
    sampleId: number
  ): Promise<Boolean> {
    if (userAuthorization.isUserOfficer(agent)) {
      return true;
    }
    const sample = await this.sampleDataSource.getSample(sampleId);

    if (sample.creatorId === agent?.id) {
      return true;
    }

    return false;
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    sampleId: number
  ): Promise<boolean> {
    if (userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const sample = await this.sampleDataSource.getSample(sampleId);
    if (sample.creatorId === agent?.id) {
      return true;
    }

    return false;
  }
}

export const sampleAuthorization = new SampleAuthorization(sampleDataSource);
