import { ReviewDataSource } from "../ReviewDataSource";
import { Review } from "../../models/Review";
import { ReviewRecord } from "./records";

import database from "./database";

export default class PostgresReviewDataSource implements ReviewDataSource {
  private createReviewObject(review: ReviewRecord) {
    return new Review(
      review.review_id,
      review.proposal_id,
      review.user_id,
      review.comment,
      review.grade,
      review.status
    );
  }

  async get(id: number): Promise<Review | null> {
    return database
      .select()
      .from("reviews")
      .where("review_id", id)
      .first()
      .then((review: ReviewRecord) => this.createReviewObject(review));
  }

  async removeUserForReview(id: number): Promise<Boolean | null> {
    return database
      .from("reviews")
      .where("review_id", id)
      .del()
      .then(() => true);
  }

  async submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | null> {
    return database
      .update(
        {
          comment,
          grade
        },
        ["*"]
      )
      .from("reviews")
      .where("review_id", reviewID)
      .then((review: any) => {
        return new Review(
          reviewID,
          review[0].proposal_id,
          review[0].user_id,
          comment,
          grade,
          0
        );
      });
  }

  async getProposalReviews(id: number): Promise<Review[]> {
    return database
      .select()
      .from("reviews")
      .where("proposal_id", id)
      .then((reviews: any[]) => {
        return reviews.map(
          review =>
            new Review(
              review.review_id,
              review.proposal_id,
              review.user_id,
              review.comment,
              review.grade,
              review.status
            )
        );
      })
      .catch(() => {
        return [];
      });
  }

  async addUserForReview(
    userID: number,
    proposalID: number
  ): Promise<Boolean | null> {
    return database
      .insert({
        user_id: userID,
        proposal_id: proposalID
      })
      .into("reviews")
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  async getUserReviews(id: number): Promise<Review[]> {
    return database
      .select()
      .from("reviews")
      .where("user_id", id)
      .then((reviews: any[]) => {
        return reviews.map(
          review =>
            new Review(
              review.review_id,
              review.proposal_id,
              review.user_id,
              review.comment,
              review.grade,
              review.status
            )
        );
      })
      .catch(() => {
        return [];
      });
  }
}
