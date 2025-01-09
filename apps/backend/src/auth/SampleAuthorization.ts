import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { UserWithRole } from '../models/User';
import { Sample } from './../resolvers/types/Sample';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class SampleAuthorization {
  constructor(
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  private async resolveSample(
    sampleOrSampleId: Sample | number
  ): Promise<Sample | null> {
    let sample;

    if (typeof sampleOrSampleId === 'number') {
      sample = await this.sampleDataSource.getSample(sampleOrSampleId);
    } else {
      sample = sampleOrSampleId;
    }

    return sample;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    sample: Sample
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    sampleId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    sampleOrSampleId: Sample | number
  ): Promise<boolean> {
    const sample = await this.resolveSample(sampleOrSampleId);

    if (!sample) {
      return false;
    }

    return this.proposalAuth.hasReadRights(agent, sample.proposalPk);
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    sample: Sample
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    sampleId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    sampleOrSampleId: Sample | number
  ): Promise<boolean> {
    const sample = await this.resolveSample(sampleOrSampleId);

    if (!sample) {
      return false;
    }

    const canEditProposal = await this.proposalAuth.hasWriteRights(
      agent,
      sample.proposalPk
    );

    const isMemberOfProposal = await this.proposalAuth.isMemberOfProposal(
      agent,
      sample.proposalPk
    );

    const isPostProposalSubmission = sample.isPostProposalSubmission === true;

    return (
      canEditProposal ||
      (isMemberOfProposal && isPostProposalSubmission) ||
      this.userAuth.isSampleSafetyReviewer(agent)
    );
  }
}
