import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { UserWithRole } from '../../models/User';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';
import { TechnicalReviewAuthorization } from '../TechnicalReviewAuthorization';

@injectable()
export class TechnicalReviewQuestionaryAuthorizer
  implements QuestionaryAuthorizer
{
  private technicalReviewAuth = container.resolve(TechnicalReviewAuthorization);

  constructor(
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource
  ) {}

  /**
   * Get the review from the questionary id
   * @param questionaryId Questionary id
   * @returns The review
   */
  async getTechnicalReview(questionaryId: number) {
    const technicalReview = (
      await this.reviewDataSource.getTechnicalReviewsByFilter({
        questionaryIds: [questionaryId],
      })
    ).technicalReviews[0];

    return technicalReview;
  }

  /**
   * Check if the user has read rights on the review
   * @param agent User
   * @param questionaryId Questionary id
   * @returns true if the user has read rights on the review
   */
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    const review = await this.getTechnicalReview(questionaryId);

    // Authorizing questionary follows the same rules as review
    return this.technicalReviewAuth.hasReadRights(agent, review);
  }

  /**
   * Check if the user has write rights on the review
   * @param agent User
   * @param questionaryId Questionary id
   * @returns true if the user has write rights on the review
   */
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    const review = await this.getTechnicalReview(questionaryId);

    // Authorizing questionary follows the same rules as proposal
    return this.technicalReviewAuth.hasWriteRights(agent, review);
  }
}
