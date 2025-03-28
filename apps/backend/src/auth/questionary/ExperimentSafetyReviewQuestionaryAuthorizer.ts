import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { UserWithRole } from '../../models/User';
import { ExperimentSafetyReviewAuthorization } from '../ExperimentSafetyReviewAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';

@injectable()
export class ExperimentSafetyReviewQuestionaryAuthorizer
  implements QuestionaryAuthorizer
{
  private experimentSafetyReviewAuth = container.resolve(
    ExperimentSafetyReviewAuthorization
  );

  constructor(
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource
  ) {}

  /**
   * Check if the user has read rights on the review
   * @param agent User
   * @param questionaryId Questionary id
   * @returns true if the user has read rights on the review
   */
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    // TODO: Keep it open for now
    return true;
  }

  /**
   * Check if the user has write rights on the review
   * @param agent User
   * @param questionaryId Questionary id
   * @returns true if the user has write rights on the review
   */
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    // TODO: Keep it open for now
    return true;
  }
}
