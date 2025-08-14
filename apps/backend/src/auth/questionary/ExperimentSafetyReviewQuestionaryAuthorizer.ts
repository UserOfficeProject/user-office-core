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

  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    // TODO: Keep it open for now
    return true;
  }

  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    // TODO: Keep it open for now
    return true;
  }
}
