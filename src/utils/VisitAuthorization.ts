import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { UserWithRole } from '../models/User';
import { VisitStatus } from '../models/Visit';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class VisitAuthorization {
  constructor(
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  async hasReadRights(agent: UserWithRole | null, visitId: number) {
    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const visit = await this.visitDataSource.getVisit(visitId);

    if (!visit) {
      return false;
    }

    return visit.visitorId === agent?.id;
  }

  async hasWriteRights(agent: UserWithRole | null, visitId: number) {
    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const visit = await this.visitDataSource.getVisit(visitId);

    if (!visit) {
      return false;
    }

    if (
      this.userAuthorization.isUser(agent) &&
      visit.status === VisitStatus.ACCEPTED
    ) {
      logger.logError('User tried to change accepted visit', {
        agent,
        visitId,
      });

      return false;
    }

    return visit.visitorId === agent?.id;
  }
}
