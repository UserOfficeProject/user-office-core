import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { ReviewStatus } from '../models/Review';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { Review } from '../resolvers/types/Review';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class ReviewAuthorization {
  constructor(
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  private async resolveReview(
    reviewOrReviewId: Review | number
  ): Promise<Review | null> {
    let review;

    if (typeof reviewOrReviewId === 'number') {
      review = await this.reviewDataSource.getReview(reviewOrReviewId);
    } else {
      review = reviewOrReviewId;
    }

    return review;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    review: Review
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    reviewId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    reviewOrReviewId: Review | number
  ): Promise<boolean> {
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (isUserOfficer) {
      return true;
    }

    const review = await this.resolveReview(reviewOrReviewId);
    if (!review) {
      return false;
    }

    const isAuthor = review.userID === agent?.id;
    if (isAuthor) {
      return true;
    }

    const currentRole = agent?.currentRole?.shortCode;

    const isChairOrSecretaryOfFap = await this.userAuth.isChairOrSecretaryOfFap(
      agent,
      review.fapID
    );
    if (isChairOrSecretaryOfFap) {
      return true;
    }

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      review.proposalPk
    );
    if (isReviewerOfProposal) {
      return true;
    }
    const isMemberOfFap = await this.userAuth.isMemberOfFap(
      agent,
      review.fapID
    );
    if (isMemberOfFap) {
      return true;
    }
    const isProposalOnUsersFacility =
      agent?.currentRole?.shortCode === Roles.FACILITY_MEMBER &&
      (await this.proposalAuth.isProposalOnUsersFacility(
        agent?.id,
        review.proposalPk
      ));
    if (isProposalOnUsersFacility) {
      return true;
    }

    return false;
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    review: Review,
    canSubmitReview?: boolean
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    review: Review,
    canSubmitReview = false
  ): Promise<boolean> {
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (isUserOfficer) {
      return true;
    }

    if (review.status === ReviewStatus.SUBMITTED && !canSubmitReview) {
      return false;
    }

    const isChairOrSecretaryOfFap = await this.userAuth.isChairOrSecretaryOfFap(
      agent,
      review.fapID
    );
    if (isChairOrSecretaryOfFap) {
      return true;
    }

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      review.proposalPk
    );
    if (isReviewerOfProposal) {
      return true;
    }

    return false;
  }
}
