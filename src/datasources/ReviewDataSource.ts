import { Review } from "../models/Review";

export interface ReviewDataSource {
  submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | null>;

  getProposalReviews(id: number): Promise<Review[]>;
  getUserReviews(id: number): Promise<Review[]>;
  addUserForReview(userID: number, proposalID: number): Promise<Boolean | null>;
}
