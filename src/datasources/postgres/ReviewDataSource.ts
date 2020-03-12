import { Review, ReviewStatus } from '../../models/Review';
import { TechnicalReview } from '../../models/TechnicalReview';
import { AddReviewArgs } from '../../resolvers/mutations/AddReviewMutation';
import { AddUserForReviewArgs } from '../../resolvers/mutations/AddUserForReviewMutation';
import { ReviewDataSource } from '../ReviewDataSource';
import database from './database';
import { ReviewRecord, TechnicalReviewRecord } from './records';

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

  private createTechnicalReviewObject(technicalReview: TechnicalReviewRecord) {
    return new TechnicalReview(
      technicalReview.technical_review_id,
      technicalReview.proposal_id,
      technicalReview.comment,
      technicalReview.time_allocation,
      technicalReview.status
    );
  }

  async setTechnicalReview(
    proposalID: number,
    comment: string,
    status: number,
    timeAllocation: number
  ): Promise<TechnicalReview> {
    if (await this.getTechnicalReview(proposalID)) {
      return database
        .update({
          proposal_id: proposalID,
          comment,
          time_allocation: timeAllocation,
          status,
        })
        .from('technical_review')
        .where('proposal_id', proposalID)
        .returning('*')
        .then((records: TechnicalReviewRecord[]) =>
          this.createTechnicalReviewObject(records[0])
        );
    }

    return database
      .insert({
        proposal_id: proposalID,
        comment,
        time_allocation: timeAllocation,
        status,
      })
      .returning('*')
      .into('technical_review')
      .then((records: TechnicalReviewRecord[]) =>
        this.createTechnicalReviewObject(records[0])
      );
  }

  async getTechnicalReview(id: number): Promise<TechnicalReview | null> {
    return database
      .select()
      .from('technical_review')
      .where('proposal_id', id)
      .first()
      .then((review: TechnicalReviewRecord) => {
        if (review === undefined) {
          return null;
        }

        return this.createTechnicalReviewObject(review);
      });
  }

  async get(id: number): Promise<Review | null> {
    return database
      .select()
      .from('reviews')
      .where('review_id', id)
      .first()
      .then((review: ReviewRecord) => this.createReviewObject(review));
  }

  async removeUserForReview(id: number): Promise<Review> {
    return database
      .from('reviews')
      .where('review_id', id)
      .returning('*')
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
          status: ReviewStatus.SUBMITTED,
        },
        ['*']
      )
      .from('reviews')
      .where('review_id', reviewID)
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
      .from('reviews')
      .where('proposal_id', id)
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
        status: ReviewStatus.DRAFT,
      })
      .returning('*')
      .into('reviews')
      .then((records: ReviewRecord[]) => this.createReviewObject(records[0]));
  }

  async getUserReviews(id: number): Promise<Review[]> {
    return database
      .select()
      .from('reviews')
      .where('user_id', id)
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
