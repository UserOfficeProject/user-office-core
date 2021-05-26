import { Review } from '../models/Review';
import { TechnicalReview } from '../models/TechnicalReview';
import { AddReviewArgs } from '../resolvers/mutations/AddReviewMutation';
import { AddTechnicalReviewInput } from '../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../resolvers/mutations/AddUserForReviewMutation';

export interface ReviewDataSource {
  removeUserForReview(id: number): Promise<Review>;
  getReview(id: number): Promise<Review | null>;
  updateReview(args: AddReviewArgs): Promise<Review>;

  getProposalReviews(id: number): Promise<Review[]>;
  getUserReviews(
    sepIds: number[],
    userId?: number,
    callId?: number,
    instrumentId?: number,
    submitted?: number
  ): Promise<Review[]>;
  getAssignmentReview(
    sepId: number,
    proposalId: number,
    userId: number
  ): Promise<Review | null>;
  setTechnicalReview(
    args: AddTechnicalReviewInput,
    shouldUpdateReview: boolean
  ): Promise<TechnicalReview>;
  getTechnicalReview(proposalID: number): Promise<TechnicalReview | null>;
  addUserForReview(args: AddUserForReviewArgs): Promise<Review>;
}
