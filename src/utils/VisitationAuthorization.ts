import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { VisitationDataSource } from '../datasources/VisitationDataSource';
import { UserWithRole } from '../models/User';
import { VisitationStatus } from '../models/Visitation';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class VisitationAuthorization {
  constructor(
    @inject(Tokens.VisitationDataSource)
    private visitationDataSource: VisitationDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  async hasReadRights(agent: UserWithRole | null, visitationId: number) {
    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const visitation = await this.visitationDataSource.getVisitation(
      visitationId
    );

    if (!visitation) {
      return false;
    }

    return visitation.visitorId === agent?.id;
  }

  async hasWriteRights(agent: UserWithRole | null, visitationId: number) {
    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const visitation = await this.visitationDataSource.getVisitation(
      visitationId
    );

    if (!visitation) {
      return false;
    }

    if (
      this.userAuthorization.isUser(agent) &&
      visitation.status === VisitationStatus.ACCEPTED
    ) {
      logger.logError('User tried to change accepted visitation', {
        agent,
        visitationId,
      });

      return false;
    }

    return visitation.visitorId === agent?.id;
  }
}
