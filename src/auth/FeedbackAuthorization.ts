import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FeedbackDataSource } from '../datasources/FeedbackDataSource';
import { Feedback } from '../models/Feedback';
import { UserWithRole } from '../models/User';
import { VisitStatus } from '../models/Visit';
import { VisitDataSource } from './../datasources/VisitDataSource';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class FeedbackAuthorization {
  constructor(
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.FeedbackDataSource)
    private feedbackDataSource: FeedbackDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  private async resolveFeedback(
    feedbackOrFeedbackId: Feedback | number
  ): Promise<Feedback | null> {
    let feedback;

    if (typeof feedbackOrFeedbackId === 'number') {
      feedback = await this.feedbackDataSource.getFeedback(
        feedbackOrFeedbackId
      );
    } else {
      feedback = feedbackOrFeedbackId;
    }

    return feedback;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    feedback: Feedback
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    feedbackId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    feedbackOrFeedbackId: Feedback | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    // User officer has access
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const feedback = await this.resolveFeedback(feedbackOrFeedbackId);

    if (!feedback) {
      return false;
    }

    const visit = await this.visitDataSource.getVisitByScheduledEventId(
      feedback.scheduledEventId
    );

    if (!visit) {
      return false;
    }

    /*
     * User can read the feedback if he is visitor of the visit
     */
    return (
      feedback.creatorId === agent.id ||
      visit.teamLeadUserId === agent.id ||
      this.visitDataSource.isVisitorOfVisit(agent.id, visit.id)
    );
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    feedback: Feedback
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    feedbackId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    feedbackOrFeedbackId: number | Feedback
  ) {
    if (!agent) {
      return false;
    }

    // User officer has access
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const feedback = await this.resolveFeedback(feedbackOrFeedbackId);

    if (!feedback) {
      return false;
    }

    const visit = await this.visitDataSource.getVisitByScheduledEventId(
      feedback.scheduledEventId
    );

    if (!visit) {
      return false;
    }

    /*
     * Teamlead can change the feedback if it is in draft status
     */
    return (
      visit.teamLeadUserId === agent.id && visit.status === VisitStatus.DRAFT
    );
  }
}
