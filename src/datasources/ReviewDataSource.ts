import { Review } from '../models/Review';
import { TechnicalReview } from '../models/TechnicalReview';
import { AddReviewArgs } from '../resolvers/mutations/AddReviewMutation';
import { AddUserForReviewArgs } from '../resolvers/mutations/AddUserForReviewMutation';

export interface ReviewDataSource {
  removeUserForReview(id: number): Promise<Review>;
  get(id: number): Promise<Review | null>;
  submitReview(args: AddReviewArgs): Promise<Review>;

  getProposalReviews(id: number): Promise<Review[]>;
  getUserReviews(id: number): Promise<Review[]>;
  setTechnicalReview(
    proposalID: number,
    comment: string,
    status: number,
    timeAllocation: number
  ): Promise<TechnicalReview>;
  getTechnicalReview(proposalID: number): Promise<TechnicalReview | null>;
  addUserForReview(args: AddUserForReviewArgs): Promise<Review>;
}
