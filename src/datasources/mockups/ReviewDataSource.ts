import { Review, ReviewWithNextProposalStatus } from '../../models/Review';
import { TechnicalReview } from '../../models/TechnicalReview';
import { AddTechnicalReviewInput } from '../../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../../resolvers/mutations/AddUserForReviewMutation';
import { UpdateReviewArgs } from '../../resolvers/mutations/UpdateReviewMutation';
import { ReviewDataSource } from '../ReviewDataSource';
import { dummyProposalTechnicalReview } from './ProposalDataSource';

export const dummyReview = new Review(4, 10, 1, 'Good proposal', 9, 0, 1);
export const dummySubmittedReview = new Review(
  5,
  10,
  1,
  'Good proposal',
  9,
  1,
  1
);
export const dummyReviewWithNextProposalStatus =
  new ReviewWithNextProposalStatus(4, 10, 1, 'Good proposal', 9, 0, 1, null);

export const dummyReviewBad = new Review(1, 9, 1, 'bad proposal', 1, 0, 1);

export class ReviewDataSourceMock implements ReviewDataSource {
  async getTechnicalReview(
    proposalPk: number
  ): Promise<TechnicalReview | null> {
    return dummyProposalTechnicalReview;
  }
  setTechnicalReview(
    args: AddTechnicalReviewInput,
    shouldUpdateReview: boolean
  ): Promise<TechnicalReview> {
    throw new Error('Method not implemented.');
  }
  async addUserForReview(args: AddUserForReviewArgs): Promise<Review> {
    const { proposalPk, userID } = args;

    return new Review(1, proposalPk, userID, ' ', 1, 1, 1);
  }
  async removeUserForReview(id: number): Promise<Review> {
    return new Review(1, 1, 1, ' ', 1, 1, 1);
  }
  async getReview(id: number): Promise<Review | null> {
    if (id === 1) {
      return dummyReviewBad;
    }

    if (id === 5) {
      return dummySubmittedReview;
    }

    return dummyReview;
  }

  async getAssignmentReview(sepId: number, proposalPk: number, userId: number) {
    return dummyReview;
  }

  async updateReview(args: UpdateReviewArgs): Promise<Review> {
    return dummyReview;
  }
  async getProposalReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
  async getUserReviews(sepIds: number[]): Promise<Review[]> {
    return [dummyReview];
  }
}
