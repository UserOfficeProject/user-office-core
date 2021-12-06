import { Feedback, FeedbackStatus } from '../../models/Feedback';
import { CreateFeedbackArgs } from '../../resolvers/mutations/CreateFeedbackMutation';
import { UpdateFeedbackArgs } from '../../resolvers/mutations/UpdateFeedbackMutation';
import { FeedbacksFilter } from '../../resolvers/queries/FeedbacksQuery';
import { FeedbackDataSource } from '../FeedbackDataSource';
import { dummyUserWithRole } from './UserDataSource';

export class FeedbackDataSourceMock implements FeedbackDataSource {
  private feedbacks: Feedback[];
  init() {
    this.feedbacks = [
      new Feedback(
        1,
        1,
        FeedbackStatus.DRAFT,
        1,
        dummyUserWithRole.id,
        new Date(),
        new Date()
      ),
    ];
  }

  async getFeedback(feedbackId: number): Promise<Feedback | null> {
    return (
      this.feedbacks.find((feedback) => feedback.id === feedbackId) ?? null
    );
  }
  async getFeedbacks(filter?: FeedbacksFilter): Promise<Feedback[]> {
    return this.feedbacks.reduce((matchingFeedbacks, currentFeedback) => {
      if (filter?.creatorId && currentFeedback.creatorId === filter.creatorId) {
        matchingFeedbacks.push(currentFeedback);
      }

      if (
        filter?.scheduledEventId &&
        currentFeedback.scheduledEventId === filter.scheduledEventId
      ) {
        matchingFeedbacks.push(currentFeedback);
      }

      return matchingFeedbacks;
    }, new Array<Feedback>());
  }

  async getFeedbackByScheduledEventId(
    eventId: number
  ): Promise<Feedback | null> {
    return (
      this.feedbacks.find(
        (feedback) => feedback.scheduledEventId === eventId
      ) ?? null
    );
  }

  async createFeedback({
    scheduledEventId,
    creatorId,
    questionaryId,
  }: CreateFeedbackArgs): Promise<Feedback> {
    const newFeedback = new Feedback(
      this.feedbacks.length,
      scheduledEventId,
      FeedbackStatus.DRAFT,
      questionaryId,
      creatorId,
      new Date(),
      null
    );

    this.feedbacks.push(newFeedback);

    return newFeedback;
  }

  async updateFeedback(args: UpdateFeedbackArgs): Promise<Feedback> {
    this.feedbacks = this.feedbacks.map((feedback) => {
      if (feedback && feedback.id === args.feedbackId) {
        args.status && (feedback.status = args.status);
      }

      return feedback;
    });

    const feedback = await this.getFeedback(args.feedbackId);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    return feedback;
  }

  async deleteFeedback(feedbackId: number): Promise<Feedback> {
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    this.feedbacks = this.feedbacks.filter(
      (currentFeedback) => currentFeedback.id !== feedbackId
    );

    return feedback;
  }
}
