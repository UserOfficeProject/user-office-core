import { ReviewDataSource } from "../ReviewDataSource";
import { Review } from "../../models/Review";
import { ReviewRecord } from "./records";

import database from "./database";
import { ReviewStatus } from "../../models/Review";
import { AddReviewArgs } from "../../resolvers/mutations/AddReviewMutation";
import { AddUserForReviewArgs } from "../../resolvers/mutations/AddUserForReviewMutation";

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

  async removeUserForReview(id: number): Promise<Review> {
    return database
      .from("reviews")
      .where("review_id", id)
      .returning("*")
      .del()
      .then((record: ReviewRecord[]) => this.createReviewObject(record[0]));
  }

  async submitReview(args: AddReviewArgs): Promise<Review> {
    const { reviewID, comment, grade } = args;
    return database
      .update(
        {
          comment,
          grade,
          status: ReviewStatus.SUBMITTED
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
      });
  }

  async addUserForReview(args: AddUserForReviewArgs): Promise<Review> {
    const { userID, proposalID } = args;
    return database
      .insert({
        user_id: userID,
        proposal_id: proposalID,
        status: ReviewStatus.DRAFT
      })
      .returning("*")
      .into("reviews")
      .then((records: ReviewRecord[]) => this.createReviewObject(records[0]));
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
      });
  }
}
