import { Feedback, FeedbackStatus } from '../../models/Feedback';
import { FeedbackRequest } from '../../models/FeedbackRequest';
import { CreateFeedbackArgs } from '../../resolvers/mutations/CreateFeedbackMutation';
import { UpdateFeedbackArgs } from '../../resolvers/mutations/UpdateFeedbackMutation';
import { FeedbacksFilter } from '../../resolvers/queries/FeedbacksQuery';
import { FeedbackDataSource } from '../FeedbackDataSource';
import { dummyUserWithRole } from './UserDataSource';

export class FeedbackDataSourceMock implements FeedbackDataSource {
  private feedbacks: Feedback[];
  private feedbackRequests: FeedbackRequest[];
  init() {
    this.feedbacks = [
      // Finished feedback
      new Feedback(
        3,
        3,
        FeedbackStatus.SUBMITTED,
        3,
        dummyUserWithRole.id,
        new Date(),
        new Date()
      ),
      // Unfinished feedback
      new Feedback(
        4,
        4,
        FeedbackStatus.DRAFT,
        4,
        dummyUserWithRole.id,
        new Date(),
        new Date()
      ),
    ];

    this.feedbackRequests = [new FeedbackRequest(1, 1, new Date())];
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

  async getFeedbackRequests(
    scheduledEventId: number
  ): Promise<FeedbackRequest[]> {
    return this.feedbackRequests.reduce(
      (matchingFeedbackRequests, currentFeedbackRequest) => {
        if (currentFeedbackRequest.scheduledEventId === scheduledEventId) {
          matchingFeedbackRequests.push(currentFeedbackRequest);
        }

        return matchingFeedbackRequests;
      },
      new Array<FeedbackRequest>()
    );
  }

  async createFeedbackRequest(
    scheduledEventId: number
  ): Promise<FeedbackRequest> {
    const newFeedbackRequest = new FeedbackRequest(
      this.feedbacks.length,
      scheduledEventId,
      new Date()
    );

    this.feedbackRequests.push(newFeedbackRequest);

    return newFeedbackRequest;
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
