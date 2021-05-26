import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { UserWithRole } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class SampleAuthorization {
  constructor(
    @inject(Tokens.SampleDataSource) private sampleDataSource: SampleDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  async hasReadRights(agent: UserWithRole | null, sampleId: number) {
    return this.hasAccessRights(agent, sampleId);
  }

  async hasWriteRights(agent: UserWithRole | null, sampleId: number) {
    return this.hasAccessRights(agent, sampleId);
  }

  private async hasAccessRights(agent: UserWithRole | null, sampleId: number) {
    if (this.userAuthorization.isUserOfficer(agent)) {
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

    return this.userAuthorization.hasAccessRights(agent, proposal);
  }
}
