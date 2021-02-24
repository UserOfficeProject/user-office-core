/* eslint-disable @typescript-eslint/camelcase */
import { Review, ReviewStatus } from '../../models/Review';
import { TechnicalReview } from '../../models/TechnicalReview';
import { AddReviewArgs } from '../../resolvers/mutations/AddReviewMutation';
import { AddTechnicalReviewInput } from '../../resolvers/mutations/AddTechnicalReviewMutation';
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
      review.status,
      review.sep_id
    );
  }

  private createTechnicalReviewObject(technicalReview: TechnicalReviewRecord) {
    return new TechnicalReview(
      technicalReview.technical_review_id,
      technicalReview.proposal_id,
      technicalReview.comment,
      technicalReview.public_comment,
      technicalReview.time_allocation,
      technicalReview.status,
      technicalReview.submitted
    );
  }

  async setTechnicalReview(
    args: AddTechnicalReviewInput,
    submitted: boolean = false
  ): Promise<TechnicalReview> {
    const { proposalID, comment, publicComment, timeAllocation, status } = args;

    const technicalReview = await this.getTechnicalReview(proposalID);

    if (technicalReview) {
      if (!technicalReview.submitted) {
        return database
          .update({
            proposal_id: proposalID,
            comment,
            public_comment: publicComment,
            time_allocation: timeAllocation,
            status,
            submitted,
          })
          .from('technical_review')
          .where('proposal_id', proposalID)
          .returning('*')
          .then((records: TechnicalReviewRecord[]) =>
            this.createTechnicalReviewObject(records[0])
          );
      } else {
        throw new Error('Technical review already submitted');
      }
    }

    return database
      .insert({
        proposal_id: proposalID,
        comment,
        public_comment: publicComment,
        time_allocation: timeAllocation,
        status,
        submitted,
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
      .from('SEP_Reviews')
      .where('review_id', id)
      .first()
      .then((review: ReviewRecord) => this.createReviewObject(review));
  }

  async getAssignmentReview(sepId: number, proposalId: number, userId: number) {
    return database
      .select()
      .from('SEP_Reviews')
      .where('sep_id', sepId)
      .andWhere('proposal_id', proposalId)
      .andWhere('user_id', userId)
      .first()
      .then((review?: ReviewRecord) =>
        review ? this.createReviewObject(review) : null
      );
  }

  async removeUserForReview(id: number): Promise<Review> {
    const [reviewRecord]: ReviewRecord[] = await database
      .from('SEP_Reviews')
      .where('review_id', id)
      .returning('*')
      .del();

    return this.createReviewObject(reviewRecord);
  }

  async updateReview(args: AddReviewArgs): Promise<Review> {
    const { reviewID, comment, grade, status, sepID } = args;

    return database
      .update(
        {
          comment,
          grade,
          status,
        },
        ['*']
      )
      .from('SEP_Reviews')
      .where('review_id', reviewID)
      .then((review: ReviewRecord[]) => {
        return new Review(
          reviewID,
          review[0].proposal_id,
          review[0].user_id,
          comment,
          grade,
          status,
          sepID
        );
      });
  }

  async getProposalReviews(id: number): Promise<Review[]> {
    return database
      .select()
      .from('SEP_Reviews')
      .where('proposal_id', id)
      .then((reviews: ReviewRecord[]) => {
        return reviews.map(review => this.createReviewObject(review));
      });
  }

  async addUserForReview(args: AddUserForReviewArgs): Promise<Review> {
    const { userID, proposalID, sepID } = args;

    return database
      .insert({
        user_id: userID,
        proposal_id: proposalID,
        status: ReviewStatus.DRAFT,
        sep_id: sepID,
      })
      .returning('*')
      .into('SEP_Reviews')
      .then((records: ReviewRecord[]) => this.createReviewObject(records[0]));
  }

  async getUserReviews(id: number): Promise<Review[]> {
    return database
      .select()
      .from('SEP_Reviews')
      .where('user_id', id)
      .then((reviews: ReviewRecord[]) => {
        return reviews.map(review => this.createReviewObject(review));
      });
  }
}
