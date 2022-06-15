import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { UserWithRole } from '../models/User';
import { TechnicalReview } from '../resolvers/types/TechnicalReview';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class TechnicalReviewAuthorization {
  private proposalAuth = container.resolve(ProposalAuthorization);
  constructor(
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  private async resolveTechnicalReview(
    technicalreviewOrProposalPk: TechnicalReview | number
  ): Promise<TechnicalReview | null> {
    let technicalreview;

    if (typeof technicalreviewOrProposalPk === 'number') {
      const proposalPk = technicalreviewOrProposalPk;
      technicalreview = await this.reviewDataSource.getTechnicalReview(
        proposalPk
      );
    } else {
      technicalreview = technicalreviewOrProposalPk;
    }

    return technicalreview;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    technicalreview: TechnicalReview
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    technicalreviewId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    technicalreviewOrTechnicalReviewId: TechnicalReview | number
  ): Promise<boolean> {
    const technicalreview = await this.resolveTechnicalReview(
      technicalreviewOrTechnicalReviewId
    );
    if (!technicalreview) {
      return false;
    }

    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (isUserOfficer) {
      return true;
    }

    const isScientistToProposal = await this.proposalAuth.isScientistToProposal(
      agent,
      technicalreview.proposalPk
    );
    const isInstrumentManagerToProposal =
      await this.proposalAuth.isInstrumentManagerToProposal(
        agent,
        technicalreview.proposalPk
      );

    if (isScientistToProposal || isInstrumentManagerToProposal) {
      return true;
    }

    const isChairOrSecretaryOfProposal =
      await this.proposalAuth.isChairOrSecretaryOfProposal(
        agent,
        technicalreview.proposalPk
      );
    if (isChairOrSecretaryOfProposal) {
      return true;
    }

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      technicalreview.proposalPk
    );
    if (isReviewerOfProposal) {
      return true;
    }

    return false;
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    technicalreview: TechnicalReview
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    proposalPk: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    technicalreviewOrProposalPk: TechnicalReview | number
  ): Promise<boolean> {
    const proposalPk =
      typeof technicalreviewOrProposalPk === 'number'
        ? technicalreviewOrProposalPk
        : technicalreviewOrProposalPk.proposalPk;

    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (isUserOfficer) {
      return true;
    }

    const isScientistToProposal = await this.proposalAuth.isScientistToProposal(
      agent,
      proposalPk
    );
    const isInstrumentManagerToProposal =
      await this.proposalAuth.isInstrumentManagerToProposal(agent, proposalPk);

    if (isScientistToProposal || isInstrumentManagerToProposal) {
      return true;
    }

    const isChairOrSecretaryOfProposal =
      await this.proposalAuth.isChairOrSecretaryOfProposal(agent, proposalPk);
    if (isChairOrSecretaryOfProposal) {
      return true;
    }

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      proposalPk
    );

    const technicalReview = await this.resolveTechnicalReview(proposalPk);
    if (isReviewerOfProposal && technicalReview?.submitted !== true) {
      return true;
    }

    return false;
  }
}
