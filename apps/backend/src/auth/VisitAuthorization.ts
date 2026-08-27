import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Proposal } from '../models/Proposal';
import { UserWithRole } from '../models/User';
import { Visit } from '../models/Visit';

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
     * User can read the visit if he is a PI
     * or on the visitor list
     */
    const [isPI, isVisitVisitor] = await Promise.all([
      this.proposalAuth.isPrincipalInvestigatorOfProposalPk(
        agent,
        visit.proposalPk
      ),
      this.visitDataSource.isVisitorOfVisit(agent.id, visit.id),
    ]);

    return visit.creatorId === agent.id || isPI || isVisitVisitor;
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    visitOrVisitId: number | Visit
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

    const isPI = await this.proposalAuth.isPrincipalInvestigatorOfProposalPk(
      agent,
      visit.proposalPk
    );

    const isTeamLead = agent.id === visit.teamLeadUserId;

    if (!isPI && !isTeamLead) {
      logger.logWarn('User tried to update visit without having write rights', {
        agent,
        visit,
      });

      return false;
    }

    return true;
  }

  async hasDeleteRights(
    agent: UserWithRole | null,
    visitOrVisitId: number | Visit
  ): Promise<boolean> {
    // Deleting a visit is a PI right, same as creating one. Only someone who
    // can created visits may delete it, i.e, the current PI.
    //
    // Also allow User Officers delete a visit.
    //
    // The team lead has write rights, but not delete rights.

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

    return this.hasCreateRights(agent, visit.proposalPk);
  }

  async hasCreateRights(
    agent: UserWithRole | null,
    proposalOrProposalPk: Proposal | number
  ): Promise<boolean> {
    // Note: User Officer Does NOT have create access

    const proposalPk =
      proposalOrProposalPk instanceof Proposal
        ? proposalOrProposalPk.primaryKey
        : proposalOrProposalPk;

    const isPi = await this.proposalAuth.isPrincipalInvestigatorOfProposalPk(
      agent,
      proposalPk
    );

    if (isPi) {
      return true;
    }

    return false;
  }
}
