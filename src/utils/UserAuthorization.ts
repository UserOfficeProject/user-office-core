import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Proposal } from '../models/Proposal';
import { Roles } from '../models/Role';
import { User, UserWithRole } from '../models/User';

@injectable()
export class UserAuthorization {
  constructor(
    @inject(Tokens.UserDataSource) private userDataSource: UserDataSource,
    @inject(Tokens.ReviewDataSource) private reviewDataSource: ReviewDataSource,
    @inject(Tokens.SEPDataSource) private sepDataSource: SEPDataSource
  ) {}

  isUserOfficer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  // NOTE: This is not a good check if it is a user or not. It should do the same check as isUserOfficer.
  isUser(agent: User | null, id: number) {
    if (agent == null) {
      return false;
    }
    if (agent.id !== id) {
      return false;
    }

    return true;
  }

  async hasRole(agent: UserWithRole | null, role: string): Promise<boolean> {
    if (agent == null) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then((roles) => {
      return roles.some((roleItem) => roleItem.shortCode === role);
    });
  }

  isPrincipalInvestigatorOfProposal(
    agent: User | null,
    proposal: Proposal | null
  ) {
    if (agent == null || proposal == null) {
      return false;
    }
    if (agent.id === proposal.proposerId) {
      return true;
    }
  }

  async isMemberOfProposal(agent: User | null, proposal: Proposal | null) {
    if (agent == null || proposal == null) {
      return false;
    }

    if (this.isPrincipalInvestigatorOfProposal(agent, proposal)) {
      return true;
    }

    return this.userDataSource.getProposalUsers(proposal.id).then((users) => {
      return users.some((user) => user.id === agent.id);
    });
  }

  async isReviewerOfProposal(agent: UserWithRole | null, proposalID: number) {
    if (agent == null || !agent.id || !agent.currentRole) {
      return false;
    }

    const sepsUserIsMemberOf = await this.sepDataSource.getUserSepsByRoleAndSepId(
      agent.id,
      agent.currentRole
    );

    const sepIdsUserIsMemberOf = sepsUserIsMemberOf.map((sep) => sep.id);

    /**
     * NOTE: Everybody who is on a(member of) SEP(Scientific evaluation panel) is able to view and review a proposal.
     * If we like to limit that we can just send userId on the getUserReviews and query for reviews that are only on that specific user.
     */
    return this.reviewDataSource
      .getUserReviews(sepIdsUserIsMemberOf)
      .then((reviews) => {
        return reviews.some((review) => review.proposalID === proposalID);
      });
  }

  async isScientistToProposal(agent: User | null, proposalID: number) {
    if (agent == null || !agent.id) {
      return false;
    }

    return this.userDataSource
      .checkScientistToProposal(agent.id, proposalID)
      .then((result) => {
        return result;
      });
  }

  async isSampleSafetyReviewer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.SAMPLE_SAFETY_REVIEWER;
  }

  async hasAccessRights(
    agent: UserWithRole | null,
    proposal: Proposal
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    return (
      this.isUserOfficer(agent) ||
      (await this.isMemberOfProposal(agent, proposal)) ||
      (await this.isReviewerOfProposal(agent, proposal.id)) ||
      (await this.isScientistToProposal(agent, proposal.id)) ||
      (await this.isChairOrSecretaryOfProposal(agent, proposal.id)) ||
      this.hasGetAccessByToken(agent)
    );
  }

  async isChairOrSecretaryOfSEP(
    agent: User | null,
    sepId: number
  ): Promise<boolean> {
    if (agent == null || !agent.id || !sepId) {
      return false;
    }

    return this.sepDataSource.isChairOrSecretaryOfSEP(agent.id, sepId);
  }

  async isChairOrSecretaryOfProposal(agent: User | null, proposalId: number) {
    if (agent == null || !agent.id || !proposalId) {
      return false;
    }

    return this.sepDataSource.isChairOrSecretaryOfProposal(
      agent.id,
      proposalId
    );
  }

  hasGetAccessByToken(agent: UserWithRole) {
    return !!agent.accessPermissions?.['ProposalQueries.get'];
  }

  async isMemberOfSEP(
    agent: UserWithRole | null,
    sepId: number
  ): Promise<boolean> {
    if (agent == null || !agent.currentRole) {
      return false;
    }

    const [sep] = await this.sepDataSource.getUserSepsByRoleAndSepId(
      agent.id,
      agent.currentRole,
      sepId
    );

    return sep !== null;
  }
}
