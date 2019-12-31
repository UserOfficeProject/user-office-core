import { Review } from "../models/Review";

export interface ReviewDataSource {
  removeUserForReview(id: number): Promise<Review>;
  get(id: number): Promise<Review | null>;
  submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review>;

  getProposalReviews(id: number): Promise<Review[]>;
  getUserReviews(id: number): Promise<Review[]>;
  addUserForReview(userID: number, proposalID: number): Promise<Review>;
}
