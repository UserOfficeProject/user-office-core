import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class TechnicalReviewAuthorization {
  constructor(
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  async hasAccessRightsToInternalReviews(
    agent: UserWithRole | null,
    technicalReviewId?: number
  ) {
    if (!technicalReviewId) {
      return false;
    }

    const technicalReview =
      await this.reviewDataSource.getTechnicalReviewById(technicalReviewId);

    if (
      technicalReview &&
      ((await this.userAuth.isInternalReviewerOnTechnicalReview(
        agent,
        technicalReviewId
      )) ||
        (await this.hasWriteRights(agent, technicalReview)))
    ) {
      return true;
    } else {
      return false;
    }
  }

  private async resolveTechnicalReview(
    technicalReviewTechnicalReviewIdOrProposalPk: TechnicalReview | number,
    instrumentId?: number
  ): Promise<TechnicalReview | null> {
    let technicalReview;

    if (
      instrumentId &&
      typeof technicalReviewTechnicalReviewIdOrProposalPk === 'number'
    ) {
      const proposalPk = technicalReviewTechnicalReviewIdOrProposalPk;
      technicalReview =
        await this.reviewDataSource.getProposalInstrumentTechnicalReview(
          proposalPk,
          instrumentId
        );
    } else if (
      typeof technicalReviewTechnicalReviewIdOrProposalPk === 'number'
    ) {
      const technicalReviewId = technicalReviewTechnicalReviewIdOrProposalPk;
      technicalReview =
        await this.reviewDataSource.getTechnicalReviewById(technicalReviewId);
    } else {
      technicalReview = technicalReviewTechnicalReviewIdOrProposalPk;
    }

    return technicalReview;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    technicalReview: TechnicalReview
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    technicalReviewId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    technicalReviewTechnicalReviewIdOrProposalPk: TechnicalReview | number
  ): Promise<boolean> {
    const technicalreview = await this.resolveTechnicalReview(
      technicalReviewTechnicalReviewIdOrProposalPk
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

    const isInternalReviewerOnTechnicalReview =
      await this.userAuth.isInternalReviewerOnTechnicalReview(
        agent,
        technicalreview.id
      );

    if (
      isScientistToProposal ||
      isInstrumentManagerToProposal ||
      isInternalReviewerOnTechnicalReview
    ) {
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
    technicalReview: TechnicalReview
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    proposalPk: number,
    instrumentId?: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    technicalReviewOrProposalPk: TechnicalReview | number,
    instrumentId?: number
  ): Promise<boolean> {
    const proposalPk =
      typeof technicalReviewOrProposalPk === 'number'
        ? technicalReviewOrProposalPk
        : technicalReviewOrProposalPk.proposalPk;

    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    const isFapSecOfFap = await this.proposalAuth.isChairOrSecretaryOfProposal(
      agent,
      proposalPk
    );

    if (isUserOfficer || isFapSecOfFap) {
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

    const technicalReview = await this.resolveTechnicalReview(
      proposalPk,
      instrumentId
    );
    if (isReviewerOfProposal && technicalReview?.submitted !== true) {
      return true;
    }

    return false;
  }
}
