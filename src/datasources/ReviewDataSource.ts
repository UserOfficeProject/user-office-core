import { Review } from "../models/Review";
import { AddReviewArgs } from "../resolvers/mutations/AddReviewMutation";

export interface ReviewDataSource {
  removeUserForReview(id: number): Promise<Review>;
  get(id: number): Promise<Review | null>;
  submitReview(args: AddReviewArgs): Promise<Review>;

  getProposalReviews(id: number): Promise<Review[]>;
  getUserReviews(id: number): Promise<Review[]>;
  addUserForReview(userID: number, proposalID: number): Promise<Review>;
}
