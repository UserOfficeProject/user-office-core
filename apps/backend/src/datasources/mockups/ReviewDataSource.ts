import { Review } from '../../models/Review';
import {
  TechnicalReview,
  TechnicalReviewStatus,
} from '../../models/TechnicalReview';
import { AddTechnicalReviewInput } from '../../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../../resolvers/mutations/AddUserForReviewMutation';
import { UpdateReviewArgs } from '../../resolvers/mutations/UpdateReviewMutation';
import { ReviewsFilter } from '../../resolvers/queries/ReviewsQuery';
import { TechnicalReviewsFilter } from '../../resolvers/queries/TechnicalReviewsQuery';
import { ReviewDataSource } from '../ReviewDataSource';
import { dummyProposalTechnicalReview } from './ProposalDataSource';

export const dummyReview = new Review(4, 10, 1, 'Good proposal', 9, 0, 1, 1);
export const dummySubmittedReview = new Review(
  5,
  10,
  1,
  'Good proposal',
  9,
  1,
  1,
  1
);

export const dummyTechnicalReview = new TechnicalReview(
  6,
  10,
  'Good proposal',
  'Good proposal (public)',
  1,
  TechnicalReviewStatus.FEASIBLE,
  false,
  1,
  null,
  1,
  1,
  1
);

export const dummyReviewBad = new Review(1, 9, 1, 'bad proposal', 1, 0, 1, 1);

export class ReviewDataSourceMock implements ReviewDataSource {
  async getProposalInstrumentTechnicalReview(
    proposalPk: number,
    instrumentId?: number
  ): Promise<TechnicalReview | null> {
    return dummyProposalTechnicalReview;
  }
  async getTechnicalReviews(
    proposalPk: number
  ): Promise<TechnicalReview[] | null> {
    return [dummyProposalTechnicalReview];
  }

  async getTechnicalReviewsByFilter(
    filter?: TechnicalReviewsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; technicalReviews: TechnicalReview[] }> {
    return {
      totalCount: 1,
      technicalReviews: [dummyTechnicalReview],
    };
  }

  async getTechnicalReviewById(
    technicalReviewId: number
  ): Promise<TechnicalReview | null> {
    return dummyProposalTechnicalReview;
  }
  setTechnicalReview(
    args: AddTechnicalReviewInput,
    shouldUpdateReview: boolean
  ): Promise<TechnicalReview> {
    throw new Error('Method not implemented.');
  }
  async addUserForReview(args: AddUserForReviewArgs): Promise<Review> {
    const { proposalPk, userID } = args;

    return new Review(1, proposalPk, userID, ' ', 1, 1, 1, 1);
  }
  async removeUserForReview(id: number): Promise<Review> {
    return new Review(1, 1, 1, ' ', 1, 1, 1, 1);
  }
  async getReview(id: number): Promise<Review | null> {
    if (id === 1) {
      return dummyReviewBad;
    }

    if (id === 5) {
      return dummySubmittedReview;
    }

    return dummyReview;
  }

  async getReviews(
    filter?: ReviewsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; reviews: Review[] }> {
    return {
      totalCount: 1,
      reviews: [dummyReview],
    };
  }

  async getAssignmentReview(fapId: number, proposalPk: number, userId: number) {
    return dummyReview;
  }

  async updateReview(args: UpdateReviewArgs): Promise<Review> {
    return dummyReview;
  }
  async getProposalReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
  async getUserReviews(fapIds: number[], userId?: number): Promise<Review[]> {
    if (userId === 3) return [];

    return [dummyReview];
  }
  async getAllUsersReviews(fapIds: number[]): Promise<Review[]> {
    return [dummyReview];
  }
}
