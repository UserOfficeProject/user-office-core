import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { VisitDataSource } from '../../datasources/VisitDataSource';
import { UserWithRole } from '../../models/User';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';
import { UserAuthorization } from '../UserAuthorization';
import { VisitAuthorization } from '../VisitAuthorization';

@injectable()
export class VisitQuestionaryAuthorizer implements QuestionaryAuthorizer {
  private visitAuth = container.resolve(VisitAuthorization);

  constructor(
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}
  /**
   * Visitor has read rights on his and other visitor questionaries
   * that ar in the same visit
   * */
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    if (!agent) {
      return false;
    }

    if (await this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const registration = (
      await this.visitDataSource.getRegistrations({
        questionaryIds: [questionaryId],
      })
    )[0];

    if (!registration) {
      return false;
    }

    return this.visitAuth.hasReadRights(agent, registration.visitId);
  }

  /**
   * Visitor has write rights only his questionary
   * */
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    if (!agent) {
      return false;
    }

    if (await this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const registration = (
      await this.visitDataSource.getRegistrations({
        questionaryIds: [questionaryId],
      })
    )[0];

    if (!registration) {
      return false;
    }

    if (registration.isRegistrationSubmitted) {
      logger.logError('User tried to update visit that is already submitted', {
        agent,
        questionaryId,
        registration,
      });

      return false;
    }

    return registration.userId === agent.id;
  }
}
