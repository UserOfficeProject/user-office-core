import { GraphQLError } from 'graphql';

import { Feedback, FeedbackStatus } from '../../models/Feedback';
import { FeedbackRequest } from '../../models/FeedbackRequest';
import { CreateFeedbackArgs } from '../../resolvers/mutations/CreateFeedbackMutation';
import { UpdateFeedbackArgs } from '../../resolvers/mutations/UpdateFeedbackMutation';
import { FeedbacksFilter } from '../../resolvers/queries/FeedbacksQuery';
import { FeedbackDataSource } from '../FeedbackDataSource';
import database from './database';
import { FeedbackRecord, FeedbackRequestRecord } from './records';

export const createFeedbackObject = (scheduledEvent: FeedbackRecord) =>
  new Feedback(
    scheduledEvent.feedback_id,
    scheduledEvent.experiment_pk,
    scheduledEvent.status,
    scheduledEvent.questionary_id,
    scheduledEvent.creator_id,
    scheduledEvent.created_at,
    scheduledEvent.submitted_at
  );

export const createFeedbackRequestObject = (
  feedbackRequest: FeedbackRequestRecord
) =>
  new FeedbackRequest(
    feedbackRequest.feedback_request_id,
    feedbackRequest.experiment_pk,
    feedbackRequest.requested_at
  );

class PostgresFeedbackDataSource implements FeedbackDataSource {
  async getFeedbacks(filter?: FeedbacksFilter): Promise<Feedback[]> {
    return database('feedbacks')
      .select('*')
      .modify((query) => {
        if (filter?.creatorId) {
          query.where('creator_id', filter.creatorId);
        }
        if (filter?.experimentPk) {
          query.where('experiment_pk', filter.experimentPk);
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
  //todo: remove
  async getFeedbackByExperimentPk(
    experimentPk: number
  ): Promise<Feedback | null> {
    return database('feedbacks')
      .select('*')
      .where({ experiment_pk: experimentPk })
      .first()
      .then((feedback) => (feedback ? createFeedbackObject(feedback) : null));
  }

  async getFeedbackRequests(experimentPk: number): Promise<FeedbackRequest[]> {
    return database('feedback_requests')
      .select('*')
      .where({ experiment_pk: experimentPk })
      .then((requests) =>
        requests.map((request) => createFeedbackRequestObject(request))
      );
  }

  async createFeedback({
    experimentPk,
    questionaryId,
    creatorId,
  }: CreateFeedbackArgs): Promise<Feedback> {
    return database('feedbacks')
      .insert({
        experiment_pk: experimentPk,
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
          throw new GraphQLError('Feedback not found');
        }

        return createFeedbackObject(result[0]);
      });
  }

  async createFeedbackRequest(experimentPk: number): Promise<FeedbackRequest> {
    return database('feedback_requests')
      .insert({ experiment_pk: experimentPk })
      .returning('*')
      .then((result: FeedbackRequestRecord[]) =>
        createFeedbackRequestObject(result[0])
      );
  }
}

export default PostgresFeedbackDataSource;
