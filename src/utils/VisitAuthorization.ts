import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { UserWithRole } from '../models/User';
import { VisitStatus } from '../models/Visit';
import { ProposalDataSource } from './../datasources/ProposalDataSource';
import { Visit } from './../models/Visit';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class VisitAuthorization {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  async hasReadRights(agent: UserWithRole | null, visitId: number) {
    if (!agent) {
      return false;
    }

    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const visit = await this.visitDataSource.getVisit(visitId);

    if (!visit) {
      return false;
    }

    return (
      visit.creatorId === agent.id ||
      this.visitDataSource.isVisitorOfVisit(agent.id, visitId)
    );
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    visit: Visit
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    visitId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    visitOrVisitId: number | Visit
  ) {
    if (!agent) {
      return false;
    }

    if (this.userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    let visit: Visit;
    if (typeof visitOrVisitId === 'number') {
      const visitFromDb = await this.visitDataSource.getVisit(visitOrVisitId);
      if (!visitFromDb) {
        return false;
      }
      visit = visitFromDb;
    } else {
      visit = visitOrVisitId;
    }

    const proposal = await this.proposalDataSource.get(visit.proposalPk);

    if (this.userAuthorization.isMemberOfProposal(agent, proposal)) {
      if (visit.status === VisitStatus.ACCEPTED) {
        logger.logError('User tried to change accepted visit', {
          agent,
          visit,
        });

        return false;
      }

      return true;
    }

    logger.logError('User tried to change visit that he is not a member of', {
      agent,
      visit,
    });

    return false;
  }
}
