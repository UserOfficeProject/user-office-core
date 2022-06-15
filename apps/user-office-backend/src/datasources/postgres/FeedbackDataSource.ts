import { Feedback, FeedbackStatus } from '../../models/Feedback';
import { FeedbackRequest } from '../../models/FeedbackRequest';
import { CreateFeedbackArgs } from '../../resolvers/mutations/CreateFeedbackMutation';
import { UpdateFeedbackArgs } from '../../resolvers/mutations/UpdateFeedbackMutation';
import { FeedbacksFilter } from '../../resolvers/queries/FeedbacksQuery';
import { FeedbackDataSource } from '../FeedbackDataSource';
import database from './database';
import {
  createFeedbackObject,
  FeedbackRecord,
  createFeedbackRequestObject,
  FeedbackRequestRecord,
} from './records';

class PostgresFeedbackDataSource implements FeedbackDataSource {
  async getFeedbacks(filter?: FeedbacksFilter): Promise<Feedback[]> {
    return database('feedbacks')
      .select('*')
      .modify((query) => {
        if (filter?.creatorId) {
          query.where('creator_id', filter.creatorId);
        }
        if (filter?.scheduledEventId) {
          query.where('scheduled_event_id', filter.scheduledEventId);
        }
        if (filter?.questionaryIds) {
          query.whereIn('questionary_id', filter.questionaryIds);
        }
      })
      .then((feedbacks: FeedbackRecord[]) =>
        feedbacks.map((feedback) => createFeedbackObject(feedback))
      );
  }

  async getFeedback(feedbackId: number): Promise<Feedback | null> {
    return database('feedbacks')
      .select('*')
      .where({ feedback_id: feedbackId })
      .first()
      .then((feedback) => (feedback ? createFeedbackObject(feedback) : null));
  }

  async getFeedbackByScheduledEventId(
    eventId: number
  ): Promise<Feedback | null> {
    return database('feedbacks')
      .select('*')
      .where({ scheduled_event_id: eventId })
      .first()
      .then((feedback) => (feedback ? createFeedbackObject(feedback) : null));
  }

  async getFeedbackRequests(
    scheduledEventId: number
  ): Promise<FeedbackRequest[]> {
    return database('feedback_requests')
      .select('*')
      .where({ scheduled_event_id: scheduledEventId })
      .then((requests) =>
        requests.map((request) => createFeedbackRequestObject(request))
      );
  }

  async createFeedback({
    scheduledEventId,
    questionaryId,
    creatorId,
  }: CreateFeedbackArgs): Promise<Feedback> {
    return database('feedbacks')
      .insert({
        scheduled_event_id: scheduledEventId,
        questionary_id: questionaryId,
        creator_id: creatorId,
      })
      .returning('*')
      .then((feedback) => createFeedbackObject(feedback[0]));
  }

  async updateFeedback(args: UpdateFeedbackArgs): Promise<Feedback> {
    if (args.status === FeedbackStatus.SUBMITTED) {
      args.submittedAt = new Date();
    } else {
      args.submittedAt = null;
    }

    return database('feedbacks')
      .update({
        status: args.status,
        submitted_at: args.submittedAt,
      })
      .where({ feedback_id: args.feedbackId })
      .returning('*')
      .then((feedback) => createFeedbackObject(feedback[0]));
  }

  async deleteFeedback(feedbackId: number): Promise<Feedback> {
    return database('feedbacks')
      .where({ feedback_id: feedbackId })
      .delete()
      .returning('*')
      .then((result) => {
        if (result.length !== 1) {
          throw new Error('Feedback not found');
        }

        return createFeedbackObject(result[0]);
      });
  }

  async createFeedbackRequest(
    scheduledEventId: number
  ): Promise<FeedbackRequest> {
    return database('feedback_requests')
      .insert({ scheduled_event_id: scheduledEventId })
      .returning('*')
      .then((result: FeedbackRequestRecord[]) =>
        createFeedbackRequestObject(result[0])
      );
  }
}

export default PostgresFeedbackDataSource;
