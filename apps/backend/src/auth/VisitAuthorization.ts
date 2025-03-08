import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { UserWithRole } from '../models/User';
import { Visit } from '../models/Visit';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class VisitAuthorization {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
  ) {}

  private async resolveVisit(
    visitOrVisitId: Visit | number
  ): Promise<Visit | null> {
    let visit;

    if (typeof visitOrVisitId === 'number') {
      visit = await this.visitDataSource.getVisit(visitOrVisitId);
    } else {
      visit = visitOrVisitId;
    }

    return visit;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    visit: Visit
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    visitId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    visitOrVisitId: Visit | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    // User officer has access
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const visit = await this.resolveVisit(visitOrVisitId);

    if (!visit) {
      return false;
    }

    /*
     * User can read the visit if he is a participant of a proposal
     * or on the visitor list
     */
    return (
      visit.creatorId === agent.id ||
      this.proposalAuth.isMemberOfProposal(agent, visit.proposalPk) ||
      this.visitDataSource.isVisitorOfVisit(agent.id, visit.id)
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

    // User officer has access
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const visit = await this.resolveVisit(visitOrVisitId);

    if (!visit) {
      return false;
    }

    const proposal = await this.proposalDataSource.get(visit.proposalPk);
    const isMemberOfProposal = await this.proposalAuth.isMemberOfProposal(
      agent,
      proposal
    );

    if (isMemberOfProposal === false) {
      logger.logWarn('User tried to update visit without having write rights', {
        agent,
        visit,
      });

      return false;
    }

    return true;
  }
}
