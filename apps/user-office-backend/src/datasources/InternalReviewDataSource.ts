import { InternalReview } from '../models/InternalReview';
import { CreateCallInput } from '../resolvers/mutations/CreateCallMutation';
import { UpdateCallInput } from '../resolvers/mutations/UpdateCallMutation';
import { InternalReviewsFilter } from '../resolvers/queries/InternalReviewsQuery';

export interface InternalReviewDataSource {
  getInternalReview(id: number): Promise<InternalReview | null>;
  getInternalReviews(filter?: InternalReviewsFilter): Promise<InternalReview[]>;
  create(args: CreateCallInput): Promise<InternalReview>;
  update(args: UpdateCallInput): Promise<InternalReview>;
  delete(id: number): Promise<InternalReview>;
}
