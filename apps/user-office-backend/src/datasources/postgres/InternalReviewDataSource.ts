import { GraphQLError } from 'graphql';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { InternalReview } from '../../models/InternalReview';
import { UserWithRole } from '../../models/User';
import { CreateInternalReviewInput } from '../../resolvers/mutations/internalReview/CreateInternalReviewMutation';
import { DeleteInternalReviewInput } from '../../resolvers/mutations/internalReview/DeleteInternalReviewMutation';
import { UpdateInternalReviewInput } from '../../resolvers/mutations/internalReview/UpdateInternalReviewMutation';
import { InternalReviewsFilter } from '../../resolvers/queries/InternalReviewsQuery';
import { InternalReviewDataSource } from '../InternalReviewDataSource';
import { ReviewDataSource } from '../ReviewDataSource';
import database from './database';
import { InternalReviewRecord } from './records';

@injectable()
export default class PostgresInternalReviewDataSource
  implements InternalReviewDataSource
{
  constructor(
    @inject(Tokens.ReviewDataSource) private reviewDataSource: ReviewDataSource
  ) {}
  private createInternalReviewObject(internalReview: InternalReviewRecord) {
    return new InternalReview(
      internalReview.internal_review_id,
      internalReview.title,
      internalReview.comment,
      internalReview.files,
      internalReview.reviewer_id,
      internalReview.technical_review_id,
      internalReview.assigned_by,
      internalReview.created_at
    );
  }

  async create(
    agent: UserWithRole,
    input: CreateInternalReviewInput
  ): Promise<InternalReview> {
    // NOTE: Double-check if the technical review exists by id provided.
    const technicalReview = await this.reviewDataSource.getTechnicalReviewById(
      input.technicalReviewId
    );
    if (!technicalReview) {
      throw new GraphQLError(
        'Could not create internal review because technical review provided could not be found'
      );
    }

    const [internalReviewRecord]: InternalReviewRecord[] = await database
      .insert({
        title: input.title,
        comment: input.comment,
        files: input.files,
        reviewer_id: input.reviewerId,
        technical_review_id: input.technicalReviewId,
        assigned_by: agent.id,
      })
      .into('internal_reviews')
      .returning('*');

    if (!internalReviewRecord) {
      throw new GraphQLError('Could not create internal review');
    }

    return this.createInternalReviewObject(internalReviewRecord);
  }

  async getInternalReview(
    internalReviewId: number
  ): Promise<InternalReview | null> {
    return database
      .select()
      .from('internal_reviews')
      .where('internal_review_id', internalReviewId)
      .first()
      .then((internalReview: InternalReviewRecord | null) =>
        internalReview ? this.createInternalReviewObject(internalReview) : null
      );
  }

  async getInternalReviews(
    filter?: InternalReviewsFilter
  ): Promise<InternalReview[]> {
    return database
      .select()
      .from('internal_reviews')
      .modify((query) => {
        if (filter?.technicalReviewId) {
          query.where('technical_review_id', filter.technicalReviewId);
        }

        if (filter?.reviewerId) {
          query.where('reviewer_id', filter.reviewerId);
        }
      })
      .then((internalReviews: InternalReviewRecord[]) => {
        const result = internalReviews.map((internalReview) =>
          this.createInternalReviewObject(internalReview)
        );

        return result;
      });
  }

  async update(
    agent: UserWithRole,
    input: UpdateInternalReviewInput
  ): Promise<InternalReview> {
    const [internalReviewRecord]: InternalReviewRecord[] = await database
      .update(
        {
          title: input.title,
          comment: input.comment,
          files: input.files,
          reviewer_id: input.reviewerId,
          technical_review_id: input.technicalReviewId,
          assigned_by: agent.id,
        },
        ['*']
      )
      .from('internal_reviews')
      .where('internal_review_id', input.id);

    if (!internalReviewRecord) {
      throw new GraphQLError(`Internal review not found ${input.id}`);
    }

    return this.createInternalReviewObject(internalReviewRecord);
  }

  async delete(input: DeleteInternalReviewInput): Promise<InternalReview> {
    const [internalReviewRecord]: InternalReviewRecord[] = await database(
      'internal_reviews'
    )
      .where('internal_review_id', input.id)
      .del()
      .returning('*');

    if (!internalReviewRecord) {
      throw new GraphQLError(
        `Could not delete internal review with id: ${input.id} `
      );
    }

    return this.createInternalReviewObject(internalReviewRecord);
  }

  async isInternalReviewerOnTechnicalReview(
    userId: number,
    technicalReviewId: number
  ) {
    const record = await database<InternalReviewRecord>('internal_reviews')
      .select('*')
      .where('technical_review_id', technicalReviewId)
      .where((qb) => {
        qb.where('reviewer_id', userId);
      })
      .first();

    return record !== undefined;
  }

  async isInternalReviewer(userId: number) {
    const record = await database<InternalReviewRecord>('internal_reviews')
      .select('*')
      .where('reviewer_id', userId)
      .first();

    return record !== undefined;
  }

  async getAllReviewersOnInternalReview(id: number): Promise<number[]> {
    const internalReviewsTheReviewerIsPartOf = await this.getInternalReviews({
      reviewerId: id,
    });

    const relatedReviewers = await database
      .select('ir.reviewer_id')
      .distinct()
      .from('internal_reviews as ir')
      .whereIn(
        'technical_review_id',
        internalReviewsTheReviewerIsPartOf.map(
          (review) => review.technicalReviewId
        )
      );

    const relatedUsers = [...relatedReviewers.map((r) => r.user_id)];

    return relatedUsers;
  }
}
