import { InternalReview } from '../models/InternalReview';
import { UserWithRole } from '../models/User';
import { CreateInternalReviewInput } from '../resolvers/mutations/internalReview/CreateInternalReviewMutation';
import { DeleteInternalReviewInput } from '../resolvers/mutations/internalReview/DeleteInternalReviewMutation';
import { UpdateInternalReviewInput } from '../resolvers/mutations/internalReview/UpdateInternalReviewMutation';
import { InternalReviewsFilter } from '../resolvers/queries/InternalReviewsQuery';

export interface InternalReviewDataSource {
  getInternalReview(id: number): Promise<InternalReview | null>;
  getInternalReviews(filter?: InternalReviewsFilter): Promise<InternalReview[]>;
  create(
    agent: UserWithRole,
    input: CreateInternalReviewInput
  ): Promise<InternalReview>;
  update(
    agent: UserWithRole,
    input: UpdateInternalReviewInput
  ): Promise<InternalReview>;
  delete(input: DeleteInternalReviewInput): Promise<InternalReview>;
  isInternalReviewerOnTechnicalReview(
    userId: number,
    technicalReviewId: number
  ): Promise<boolean>;
  isInternalReviewer(userId: number): Promise<boolean>;
  getAllReviewersOnInternalReview(id: number): Promise<number[]>;
}
