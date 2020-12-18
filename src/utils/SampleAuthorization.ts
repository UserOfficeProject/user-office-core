import { logger, Logger } from '@esss-swap/duo-logger';

import { proposalDataSource, sampleDataSource } from '../datasources';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { UserWithRole } from '../models/User';
import { userAuthorization } from '../utils/UserAuthorization';

export class SampleAuthorization {
  constructor(
    private sampleDataSource: SampleDataSource,
    private proposalDataSource: ProposalDataSource,
    private logger: Logger
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

    const proposal = await this.proposalDataSource.get(sample.proposalId);

    if (!proposal) {
      this.logger.logError('Could not find proposal for sample', {
        sampleId,
      });

      return false;
    }

    return userAuthorization.hasAccessRights(agent, proposal);
  }
}

export const sampleAuthorization = new SampleAuthorization(
  sampleDataSource,
  proposalDataSource,
  logger
);
