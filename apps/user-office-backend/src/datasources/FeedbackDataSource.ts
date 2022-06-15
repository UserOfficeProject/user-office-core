import { Feedback } from '../models/Feedback';
import { CreateFeedbackArgs } from '../resolvers/mutations/CreateFeedbackMutation';
import { UpdateFeedbackArgs } from '../resolvers/mutations/UpdateFeedbackMutation';
import { FeedbacksFilter } from '../resolvers/queries/FeedbacksQuery';
import { FeedbackRequest } from './../models/FeedbackRequest';

export interface FeedbackDataSource {
  // Read
  getFeedback(feedbackId: number): Promise<Feedback | null>;
  getFeedbacks(filter?: FeedbacksFilter): Promise<Feedback[]>;
  getFeedbackByScheduledEventId(eventId: number): Promise<Feedback | null>;
  getFeedbackRequests(scheduledEventId: number): Promise<FeedbackRequest[]>;
  // Write
  createFeedback(args: CreateFeedbackArgs): Promise<Feedback>;
  updateFeedback(args: UpdateFeedbackArgs): Promise<Feedback>;
  deleteFeedback(feedbackId: number): Promise<Feedback>;
  createFeedbackRequest(scheduledEventId: number): Promise<FeedbackRequest>;
}
