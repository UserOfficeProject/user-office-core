import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { FeedbackDataSource } from '../../datasources/FeedbackDataSource';
import { UserWithRole } from '../../models/User';
import { FeedbackAuthorization } from '../FeedbackAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';

@injectable()
export class FeedbackQuestionaryAuthorizer implements QuestionaryAuthorizer {
  private feedbackAuth = container.resolve(FeedbackAuthorization);

  constructor(
    @inject(Tokens.FeedbackDataSource)
    private feedbackDataSource: FeedbackDataSource
  ) {}
  /**
   * Questionary auth follows the same rules as feedback auth
   * */
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    const feedback = (
      await this.feedbackDataSource.getFeedbacks({
        questionaryIds: [questionaryId],
      })
    )[0];

    if (!feedback) {
      return false;
    }

    return this.feedbackAuth.hasReadRights(agent, feedback.id);
  }

  /**
   * Questionary auth follows the same rules as feedback auth
   * */
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    const feedback = (
      await this.feedbackDataSource.getFeedbacks({
        questionaryIds: [questionaryId],
      })
    )[0];

    if (!feedback) {
      return false;
    }

    return this.feedbackAuth.hasWriteRights(agent, feedback.id);
  }
}
