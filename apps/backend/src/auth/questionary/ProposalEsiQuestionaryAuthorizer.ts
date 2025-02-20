import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ExperimentDataSource } from '../../datasources/ExperimentDataSource';
import { UserWithRole } from '../../models/User';
import { ExperimentSafetyAuthorization } from '../ExperimentSafetyAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';

@injectable()
export class ProposalEsiQuestionaryAuthorizer implements QuestionaryAuthorizer {
  private experimentSafetyAuth = container.resolve(
    ExperimentSafetyAuthorization
  );

  constructor(
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource
  ) {}

  async getExperimentSafetyPk(
    esiQuestionaryId: number
  ): Promise<number | null> {
    const experimentSafety =
      await this.experimentDataSource.getExperimentSafetyByESIQuestionaryId(
        esiQuestionaryId
      );

    return experimentSafety ? experimentSafety.experimentSafetyPk : null;
  }
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    const experimentSafetyPk = await this.getExperimentSafetyPk(questionaryId);
    if (experimentSafetyPk === null) {
      return false;
    }

    return this.experimentSafetyAuth.hasReadRights(agent, experimentSafetyPk);
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    const experimentSafetyPk = await this.getExperimentSafetyPk(questionaryId);
    if (experimentSafetyPk === null) {
      return false;
    }

    return this.experimentSafetyAuth.hasWriteRights(agent, experimentSafetyPk);
  }
}
