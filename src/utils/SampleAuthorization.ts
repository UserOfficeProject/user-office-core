import { logger } from '@esss-swap/duo-logger';

import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { UserWithRole } from '../models/User';
import { userAuthorization } from '../utils/UserAuthorization';

export class SampleAuthorization {
  constructor(
    private sampleDataSource: SampleDataSource,
    private proposalDataSource: ProposalDataSource
  ) {}

  async hasReadRights(agent: UserWithRole | null, sampleId: number) {
    return this.hasAccessRights(agent, sampleId);
  }

  async hasWriteRights(agent: UserWithRole | null, sampleId: number) {
    return this.hasAccessRights(agent, sampleId);
  }

  private async hasAccessRights(agent: UserWithRole | null, sampleId: number) {
    if (await userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const sample = await this.sampleDataSource.getSample(sampleId);

    if (!sample) {
      return false;
    }

    const proposal = await this.proposalDataSource.get(sample.proposalId);

    if (!proposal) {
      logger.logError('Could not find proposal for sample', {
        sampleId,
      });

      return false;
    }

    return userAuthorization.hasAccessRights(agent, proposal);
  }
}
