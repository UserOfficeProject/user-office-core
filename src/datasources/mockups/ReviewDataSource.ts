import { Review, ReviewWithNextProposalStatus } from '../../models/Review';
import { TechnicalReview } from '../../models/TechnicalReview';
import { AddReviewArgs } from '../../resolvers/mutations/AddReviewMutation';
import { AddTechnicalReviewInput } from '../../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../../resolvers/mutations/AddUserForReviewMutation';
import { ReviewDataSource } from '../ReviewDataSource';

export const dummyReview = new Review(4, 10, 1, 'Good proposal', 9, 0, 1);
export const dummyReviewWithNextProposalStatus = new ReviewWithNextProposalStatus(
  4,
  10,
  1,
  'Good proposal',
  9,
  0,
  1,
  null
);

export const dummyReviewBad = new Review(1, 9, 1, 'bad proposal', 1, 0, 1);

export class ReviewDataSourceMock implements ReviewDataSource {
  getTechnicalReview(proposalID: number): Promise<TechnicalReview | null> {
    throw new Error('Method not implemented.');
  }
  setTechnicalReview(
    args: AddTechnicalReviewInput,
    shouldUpdateReview: boolean
  ): Promise<TechnicalReview> {
    throw new Error('Method not implemented.');
  }
  async addUserForReview(args: AddUserForReviewArgs): Promise<Review> {
    const { proposalID, userID } = args;

    return new Review(1, proposalID, userID, ' ', 1, 1, 1);
  }
  async removeUserForReview(id: number): Promise<Review> {
    return new Review(1, 1, 1, ' ', 1, 1, 1);
  }
  async getReview(id: number): Promise<Review | null> {
    if (id == 1) {
      return dummyReviewBad;
    }

    return dummyReview;
  }

  async getAssignmentReview(sepId: number, proposalId: number, userId: number) {
    return dummyReview;
  }

  async updateReview(args: AddReviewArgs): Promise<Review> {
    return dummyReview;
  }
  async getProposalReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
  async getUserReviews(sepIds: number[]): Promise<Review[]> {
    return [dummyReview];
  }
}
