import { Review } from '../models/Review';
import { TechnicalReview } from '../models/TechnicalReview';
import { AddTechnicalReviewInput } from '../resolvers/mutations/AddTechnicalReviewMutation';
import { UpdateReviewArgs } from '../resolvers/mutations/UpdateReviewMutation';
import { ReviewsFilter } from '../resolvers/queries/ReviewsQuery';

export interface ReviewDataSource {
  removeUserForReview(id: number): Promise<Review>;
  getReview(id: number): Promise<Review | null>;

  getReviews(
    filter?: ReviewsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; reviews: Review[] }>;

  updateReview(args: UpdateReviewArgs): Promise<Review>;
  getProposalReviews(proposalPk: number, fapId?: number): Promise<Review[]>;
  getUserReviews(
    fapIds: number[],
    userId?: number,
    callId?: number,
    instrumentId?: number,
    submitted?: number
  ): Promise<Review[]>;
  getAllUsersReviews(
    fapIds: number[],
    userId?: number,
    callId?: number,
    instrumentId?: number,
    submitted?: number
  ): Promise<Review[]>;
  getAssignmentReview(
    fapId: number,
    proposalPk: number,
    userId: number
  ): Promise<Review | null>;
  setTechnicalReview(
    args: AddTechnicalReviewInput,
    shouldUpdateReview: boolean
  ): Promise<TechnicalReview>;
  getProposalInstrumentTechnicalReview(
    proposalPk: number,
    instrumentId?: number
  ): Promise<TechnicalReview | null>;
  // TODO: Maybe this should be called getAllProposalTechnicalReviews
  getTechnicalReviews(proposalPk: number): Promise<TechnicalReview[] | null>;
  getTechnicalReviewsByFilter(
    filter?: ReviewsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; technicalReviews: TechnicalReview[] }>;
  getTechnicalReviewById(
    technicalReviewId: number
  ): Promise<TechnicalReview | null>;
  addUserForReview(args: {
    userID: number;
    proposalPk: number;
    fapID: number;
    questionaryID: number;
  }): Promise<Review>;
}
