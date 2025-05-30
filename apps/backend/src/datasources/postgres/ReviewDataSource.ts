import { GraphQLError } from 'graphql';

import { Review, ReviewStatus } from '../../models/Review';
import { TechnicalReview } from '../../models/TechnicalReview';
import { AddTechnicalReviewInput } from '../../resolvers/mutations/AddTechnicalReviewMutation';
import { SubmitTechnicalReviewInput } from '../../resolvers/mutations/SubmitTechnicalReviewMutation';
import { UpdateReviewArgs } from '../../resolvers/mutations/UpdateReviewMutation';
import { ReviewsFilter } from '../../resolvers/queries/ReviewsQuery';
import { ReviewDataSource } from '../ReviewDataSource';
import database from './database';
import {
  createReviewObject,
  createTechnicalReviewObject,
  InstrumentHasProposalRecord,
  ReviewRecord,
  TechnicalReviewRecord,
} from './records';

export default class PostgresReviewDataSource implements ReviewDataSource {
  async setTechnicalReview(
    args: AddTechnicalReviewInput | SubmitTechnicalReviewInput,
    shouldUpdateReview: boolean
  ): Promise<TechnicalReview> {
    const {
      proposalPk,
      comment,
      publicComment,
      timeAllocation,
      status,
      reviewerId,
      submitted = false,
      files,
      instrumentId,
      questionaryId,
    } = args;

    if (shouldUpdateReview) {
      return database
        .update({
          proposal_pk: proposalPk,
          comment,
          public_comment: publicComment,
          time_allocation: timeAllocation,
          status,
          submitted,
          reviewer_id: reviewerId,
          files,
          questionary_id: questionaryId,
        })
        .from('technical_review')
        .where('proposal_pk', proposalPk)
        .andWhere('instrument_id', instrumentId)
        .returning('*')
        .then((records: TechnicalReviewRecord[]) =>
          createTechnicalReviewObject(records[0])
        );
    }

    const instrumentHasProposalRecord = await database
      .select<InstrumentHasProposalRecord>('*')
      .from('instrument_has_proposals')
      .where('instrument_id', instrumentId)
      .andWhere('proposal_pk', proposalPk)
      .first();

    if (!instrumentHasProposalRecord) {
      throw new GraphQLError(
        `Could not create technical review for proposal ${proposalPk} with instrument: ${instrumentId}`
      );
    }

    return database
      .insert({
        proposal_pk: proposalPk,
        comment,
        public_comment: publicComment,
        time_allocation: timeAllocation,
        status,
        submitted,
        reviewer_id: reviewerId,
        files,
        instrument_id: instrumentId,
        instrument_has_proposals_id:
          instrumentHasProposalRecord.instrument_has_proposals_id,
        questionary_id: questionaryId,
      })
      .returning('*')
      .into('technical_review')
      .then((records: TechnicalReviewRecord[]) =>
        createTechnicalReviewObject(records[0])
      );
  }

  async getTechnicalReviews(id: number): Promise<TechnicalReview[] | null> {
    return database
      .select()
      .from('technical_review')
      .where('proposal_pk', id)
      .orderBy('technical_review_id')
      .then((reviews: TechnicalReviewRecord[]) => {
        return reviews.map((review) => createTechnicalReviewObject(review));
      });
  }

  async getTechnicalReviewsByFilter(
    filter?: ReviewsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; technicalReviews: TechnicalReview[] }> {
    return database
      .select([
        'technical_review.*',
        database.raw('count(*) OVER() AS full_count'),
      ])
      .from('technical_review')
      .orderBy('technical_review.technical_review_id', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query.where('comment', 'ilike', `%${filter.text}%`);
        }

        if (filter?.questionaryIds) {
          query.whereIn(
            'technical_review.questionary_id',
            filter.questionaryIds
          );
        }

        if (filter?.templateIds) {
          query
            .leftJoin(
              'questionary',
              'questionary.questionary_id',
              'technical_review.questionary_id'
            )
            .whereIn('questionary.template_id', filter.templateIds);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then(
        (
          technicalReviews: (TechnicalReviewRecord & { full_count: number })[]
        ) => {
          const revs = technicalReviews.map((technicalReview) =>
            createTechnicalReviewObject(technicalReview)
          );

          return {
            totalCount: technicalReviews[0]
              ? technicalReviews[0].full_count
              : 0,
            technicalReviews: revs,
          };
        }
      );
  }

  async getProposalInstrumentTechnicalReview(
    proposalId: number,
    instrumentId?: number
  ): Promise<TechnicalReview | null> {
    return database
      .select()
      .from('technical_review')
      .where('proposal_pk', proposalId)
      .modify((query) => {
        if (instrumentId) {
          query.andWhere('instrument_id', instrumentId);
        }
      })
      .first()
      .then((review: TechnicalReviewRecord) => {
        if (review === undefined) {
          return null;
        }

        return createTechnicalReviewObject(review);
      });
  }

  async getTechnicalReviewById(technicalReviewId: number) {
    const technicalReview = database
      .select()
      .from('technical_review')
      .where('technical_review_id', technicalReviewId)
      .first()
      .then((review: TechnicalReviewRecord) => {
        if (review === undefined) {
          return null;
        }

        return createTechnicalReviewObject(review);
      });

    return technicalReview;
  }

  async getReview(id: number): Promise<Review | null> {
    return database
      .select()
      .from('fap_reviews')
      .where('review_id', id)
      .first()
      .then((review: ReviewRecord) => createReviewObject(review));
  }

  async getReviews(
    filter?: ReviewsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; reviews: Review[] }> {
    return database
      .select(['fap_reviews.*', database.raw('count(*) OVER() AS full_count')])
      .from('fap_reviews')
      .orderBy('fap_reviews.review_id', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query.where('comment', 'ilike', `%${filter.text}%`);
        }

        if (filter?.questionaryIds) {
          query.whereIn('fap_reviews.questionary_id', filter.questionaryIds);
        }

        if (filter?.templateIds) {
          query
            .leftJoin(
              'questionary',
              'questionary.questionary_id',
              'fap_reviews.questionary_id'
            )
            .whereIn('questionary.template_id', filter.templateIds);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((reviews: ReviewRecord[]) => {
        const revs = reviews.map((review) => createReviewObject(review));

        return {
          totalCount: reviews[0] ? reviews[0].full_count : 0,
          reviews: revs,
        };
      });
  }

  async getAssignmentReview(fapId: number, proposalPk: number, userId: number) {
    return database
      .select()
      .from('fap_reviews')
      .where('fap_id', fapId)
      .andWhere('proposal_pk', proposalPk)
      .andWhere('user_id', userId)
      .first()
      .then((review?: ReviewRecord) =>
        review ? createReviewObject(review) : null
      );
  }

  async removeUserForReview(id: number): Promise<Review> {
    const [reviewRecord]: ReviewRecord[] = await database
      .from('fap_reviews')
      .where('review_id', id)
      .returning('*')
      .del();

    return createReviewObject(reviewRecord);
  }

  async updateReview(args: UpdateReviewArgs): Promise<Review> {
    const { reviewID, comment, grade, status } = args;

    return database
      .update(
        {
          comment,
          grade,
          status,
        },
        ['*']
      )
      .from('fap_reviews')
      .where('review_id', reviewID)
      .then((review: ReviewRecord[]) => {
        return createReviewObject(review[0]);
      });
  }

  async getProposalReviews(
    proposalPk: number,
    fapId?: number
  ): Promise<Review[]> {
    const subQuery = database
      .select('*')
      .from('fap_reviews as fr')
      .distinctOn('fr.review_id')
      .where('fr.proposal_pk', proposalPk)
      .modify((query) => {
        if (fapId) {
          query.andWhere('fr.fap_id', fapId);
        }
      })
      .orderBy('fr.review_id', 'asc')
      .as('fa');

    return database
      .select('*')
      .from(subQuery)
      .orderBy('fa.rank', 'asc')
      .then((reviews: ReviewRecord[]) => {
        return reviews.map((review) => createReviewObject(review));
      });
  }

  async addUserForReview(args: {
    userID: number;
    proposalPk: number;
    fapID: number;
    questionaryID: number;
  }): Promise<Review> {
    const { userID, proposalPk, fapID, questionaryID } = args;

    return database
      .insert({
        user_id: userID,
        proposal_pk: proposalPk,
        status: ReviewStatus.DRAFT,
        fap_id: fapID,
        questionary_id: questionaryID,
      })
      .returning('*')
      .into('fap_reviews')
      .then((records: ReviewRecord[]) => createReviewObject(records[0]));
  }

  async getUserReviews(
    fapIds: number[],
    userId?: number,
    callId?: number,
    instrumentId?: number,
    status?: ReviewStatus
  ): Promise<Review[]> {
    return database
      .select()
      .from('fap_reviews')
      .modify((qb) => {
        if (userId) {
          qb.where('user_id', userId);
        }

        // sometimes the ID 0 is sent as a equivalent of all
        if (callId) {
          qb.join('proposals', {
            'proposals.proposal_pk': 'fap_reviews.proposal_pk',
          });
          qb.where('proposals.call_id', callId);
        }

        // sometimes the ID 0 is sent as a equivalent of all
        if (instrumentId) {
          qb.join('instrument_has_proposals', {
            'instrument_has_proposals.proposal_pk': 'fap_reviews.proposal_pk',
          });
          qb.where('instrument_has_proposals.instrument_id', instrumentId);
        }

        if (status !== undefined && status !== null) {
          qb.where('fap_reviews.status', status);
        }
      })
      .whereIn('fap_id', fapIds)
      .distinctOn('fap_reviews.proposal_pk')
      .then((reviews: ReviewRecord[]) => {
        return reviews.map((review) => createReviewObject(review));
      });
  }

  async updateInstrumentContact(
    userId: number,
    instrumentId: number
  ): Promise<boolean> {
    try {
      await database('technical_review')
        .where({ instrument_id: instrumentId })
        .andWhere({ submitted: false })
        .update({ technical_review_assignee_id: userId });

      return true;
    } catch (error) {
      throw new GraphQLError('Failed to update instrument contact.');
    }
  }

  /*Brief explanation of the query used in getAllUsersReviews
    This query gets executed when a reviewer wishes to see all the proposals
    (proposals where they are assigned as a reviewer and where they are not) 
    in a FAP. Logged in reviewer's id will be returned as the reviewer against 
    a proposal if the proposal is being reviewed by him and others. Reviewers
    other than him will be ignored for that proposal.
  */
  async getAllUsersReviews(
    fapIds: number[],
    userId?: number,
    callId?: number,
    instrumentId?: number,
    status?: ReviewStatus
  ): Promise<Review[]> {
    return database
      .select('fapReviewsTemp.*')
      .from(
        database
          .select('fap_reviews.*')
          .from('fap_reviews')
          .modify((qb) => {
            if (callId) {
              qb.join('proposals', {
                'proposals.proposal_pk': 'fap_reviews.proposal_pk',
              });
              qb.where('proposals.call_id', callId);
            }
            if (instrumentId) {
              qb.join('instrument_has_proposals', {
                'instrument_has_proposals.proposal_pk':
                  'fap_reviews.proposal_pk',
              });
              qb.where('instrument_has_proposals.instrument_id', instrumentId);
            }

            if (status !== null && status !== undefined) {
              qb.where('fap_reviews.status', status);
            }
          })
          .whereIn('fap_id', fapIds)
          .as('fapReviewsTemp')
      )
      .modify((query) =>
        query
          .where('user_id', userId)
          .orWhereNotIn(
            'proposal_pk',
            database
              .select('proposal_pk')
              .from('fap_reviews')
              .where('user_id', userId)
              .distinctOn('proposal_pk')
          )
          .distinctOn('proposal_pk')
      )
      .then((reviews: ReviewRecord[]) => {
        return reviews.map((review) => createReviewObject(review));
      });
  }
}
