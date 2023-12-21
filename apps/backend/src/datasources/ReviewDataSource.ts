import { Review } from '../models/Review';
import { TechnicalReview } from '../models/TechnicalReview';
import { AddTechnicalReviewInput } from '../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../resolvers/mutations/AddUserForReviewMutation';
import { UpdateReviewArgs } from '../resolvers/mutations/UpdateReviewMutation';

export interface ReviewDataSource {
  removeUserForReview(id: number): Promise<Review>;
  getReview(id: number): Promise<Review | null>;
  updateReview(args: UpdateReviewArgs): Promise<Review>;

  getProposalReviews(id: number): Promise<Review[]>;
  getUserReviews(
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
    instrumentId: number
  ): Promise<TechnicalReview | null>;
  // TODO: Maybe this should be called getAllProposalTechnicalReviews
  getTechnicalReviews(proposalPk: number): Promise<TechnicalReview[] | null>;
  getTechnicalReviewById(
    technicalReviewId: number
  ): Promise<TechnicalReview | null>;
  addUserForReview(args: AddUserForReviewArgs): Promise<Review>;
}
