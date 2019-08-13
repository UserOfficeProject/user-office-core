import { ReviewDataSource } from "../ReviewDataSource";
import { Review } from "../../models/Review";

export const dummyReview = new Review(4, 10, 1, "Good proposal", 9, 0);

export const dummyReviewbad = new Review(1, 9, 1, "bad proposal", 1, 0);

export class reviewDataSource implements ReviewDataSource {
  async addUserForReview(
    userID: number,
    proposalID: number
  ): Promise<Boolean | null> {
    return true;
  }
  async removeUserForReview(id: number): Promise<Boolean | null> {
    return true;
  }
  async get(id: number): Promise<Review | null> {
    if (id == 1) {
      return dummyReviewbad;
    }
    return dummyReview;
  }
  async submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | null> {
    return dummyReview;
  }
  async getProposalReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
  async getUserReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
}
