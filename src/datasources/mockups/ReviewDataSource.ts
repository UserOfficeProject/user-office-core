import { ReviewDataSource } from "../ReviewDataSource";
import { Review } from "../../models/Review";
import { AddReviewArgs } from "../../resolvers/mutations/AddReviewMutation";
import { AddUserForReviewArgs } from "../../resolvers/mutations/AddUserForReviewMutation";

export const dummyReview = new Review(4, 10, 1, "Good proposal", 9, 0);

export const dummyReviewBad = new Review(1, 9, 1, "bad proposal", 1, 0);

export class reviewDataSource implements ReviewDataSource {
  async addUserForReview(args: AddUserForReviewArgs): Promise<Review> {
    const { proposalID, userID } = args;
    return new Review(1, proposalID, userID, " ", 1, 1);
  }
  async removeUserForReview(id: number): Promise<Review> {
    return new Review(1, 1, 1, " ", 1, 1);
  }
  async get(id: number): Promise<Review | null> {
    if (id == 1) {
      return dummyReviewBad;
    }
    return dummyReview;
  }
  async submitReview(args: AddReviewArgs): Promise<Review> {
    return dummyReview;
  }
  async getProposalReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
  async getUserReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
}
