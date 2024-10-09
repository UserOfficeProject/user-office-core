import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ReviewDataSource } from '../../datasources/ReviewDataSource';
import { UserWithRole } from '../../models/User';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';
import { ReviewAuthorization } from '../ReviewAuthorization';

@injectable()
export class FapReviewQuestionaryAuthorizer implements QuestionaryAuthorizer {
  private reviewAuth = container.resolve(ReviewAuthorization);

  constructor(
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource
  ) {}

  /**
   * Get the review from the questionary id
   * @param questionaryId Questionary id
   * @returns The review
   */
  async getReview(questionaryId: number) {
    const review = (
      await this.reviewDataSource.getReviews({
        questionaryIds: [questionaryId],
      })
    ).reviews[0];

    return review;
  }

  /**
   * Check if the user has read rights on the review
   * @param agent User
   * @param questionaryId Questionary id
   * @returns true if the user has read rights on the review
   */
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    const review = await this.getReview(questionaryId);

    // Authorizing questionary follows the same rules as review
    return this.reviewAuth.hasReadRights(agent, review);
  }

  /**
   * Check if the user has write rights on the review
   * @param agent User
   * @param questionaryId Questionary id
   * @returns true if the user has write rights on the review
   */
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    const review = await this.getReview(questionaryId);

    // Authorizing questionary follows the same rules as proposal
    return this.reviewAuth.hasWriteRights(agent, review);
  }
}
