import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { ProposalStatusDefaultShortCodes } from '../models/ProposalStatus';
import { User, UserWithRole } from '../models/User';
import { Proposal } from '../resolvers/types/Proposal';
import { ProposalSettingsDataSource } from './../datasources/ProposalSettingsDataSource';
import { UserDataSource } from './../datasources/UserDataSource';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class ProposalAuthorization {
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource,
    @inject(Tokens.SEPDataSource)
    private sepDataSource: SEPDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.ProposalSettingsDataSource)
    private proposalSettingsDataSource: ProposalSettingsDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  private async resolveProposal(
    proposalOrProposalId: Proposal | number
  ): Promise<Proposal | null> {
    let proposal;

    if (typeof proposalOrProposalId === 'number') {
      proposal = await this.proposalDataSource.get(proposalOrProposalId);
    } else {
      proposal = proposalOrProposalId;
    }

    return proposal;
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

  async isMemberOfProposal(
    agent: User | null,
    proposalPk: number
  ): Promise<boolean>;
  async isMemberOfProposal(
    agent: User | null,
    proposal: Proposal | null
  ): Promise<boolean>;
  async isMemberOfProposal(
    agent: User | null,
    proposalOrPk: Proposal | number | null
  ) {
    if (agent == null || proposalOrPk == null) {
      return false;
    }

    let proposal: Proposal;
    if (typeof proposalOrPk === 'number') {
      const proposalFromDb = await this.proposalDataSource.get(proposalOrPk);
      if (!proposalFromDb) {
        return false;
      }
      proposal = proposalFromDb;
    } else {
      proposal = proposalOrPk;
    }

    if (this.isPrincipalInvestigatorOfProposal(agent, proposal)) {
      return true;
    }

    return this.userDataSource
      .getProposalUsers(proposal.primaryKey)
      .then((users) => {
        return users.some((user) => user.id === agent.id);
      });
  }

  async isReviewerOfProposal(agent: UserWithRole | null, proposalPk: number) {
    if (agent == null || !agent.id || !agent.currentRole) {
      return false;
    }

    const sepsUserIsMemberOf =
      await this.sepDataSource.getUserSepsByRoleAndSepId(
        agent.id,
        agent.currentRole
      );

    const sepIdsUserIsMemberOf = sepsUserIsMemberOf.map((sep) => sep.id);

    return this.reviewDataSource
      .getUserReviews(sepIdsUserIsMemberOf, agent.id)
      .then((reviews) => {
        return reviews.some((review) => review.proposalPk === proposalPk);
      });
  }

  async isScientistToProposal(agent: User | null, proposalPk: number) {
    if (agent == null || !agent.id) {
      return false;
    }

    return this.userDataSource
      .checkScientistToProposal(agent.id, proposalPk)
      .then((result) => {
        return result;
      });
  }

  async isInstrumentManagerToProposal(agent: User | null, proposalPk: number) {
    if (agent == null || !agent.id) {
      return false;
    }

    return this.userDataSource
      .checkInstrumentManagerToProposal(agent.id, proposalPk)
      .then((result) => {
        return result;
      });
  }

  isVisitorOfProposal(
    agent: UserWithRole,
    proposalPk: number
  ): boolean | PromiseLike<boolean> {
    return this.visitDataSource.isVisitorOfProposal(agent.id, proposalPk);
  }

  async isChairOrSecretaryOfProposal(agent: User | null, proposalPk: number) {
    if (agent == null || !agent.id || !proposalPk) {
      return false;
    }

    return this.sepDataSource.isChairOrSecretaryOfProposal(
      agent.id,
      proposalPk
    );
  }

  async hasReadRights(
    agent: UserWithRole | null,
    proposal: Proposal
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    proposalId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    proposalOrProposalId: Proposal | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const proposal = await this.resolveProposal(proposalOrProposalId);

    if (!proposal) {
      return false;
    }

    return (
      this.userAuth.isUserOfficer(agent) ||
      this.userAuth.isInstrumentScientist(agent) ||
      this.userAuth.hasGetAccessByToken(agent) ||
      (await this.isMemberOfProposal(agent, proposal)) ||
      (await this.isReviewerOfProposal(agent, proposal.primaryKey)) ||
      (await this.isScientistToProposal(agent, proposal.primaryKey)) ||
      (await this.isInstrumentManagerToProposal(agent, proposal.primaryKey)) ||
      (await this.isChairOrSecretaryOfProposal(agent, proposal.primaryKey)) ||
      (await this.isVisitorOfProposal(agent, proposal.primaryKey))
    );
  }

  private async isProposalEditable(proposal: Proposal): Promise<boolean> {
    const callId = proposal.callId;
    const isCallActive = await this.callDataSource.checkActiveCall(callId);
    const proposalStatus = (
      await this.proposalSettingsDataSource.getProposalStatus(proposal.statusId)
    )?.shortCode;

    if (proposalStatus === ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED) {
      return true;
    }

    if (isCallActive) {
      return proposalStatus === ProposalStatusDefaultShortCodes.DRAFT;
    } else {
      return false;
    }
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    proposal: Proposal
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    proposalId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    proposalOrProposalId: Proposal | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const proposal = await this.resolveProposal(proposalOrProposalId);

    if (!proposal) {
      return false;
    }

    if (
      this.userAuth.isUserOfficer(agent) ||
      this.userAuth.hasGetAccessByToken(agent)
    ) {
      return true;
    }

    const isMemberOfProposal = await this.isMemberOfProposal(agent, proposal);
    const isProposalEditable = await this.isProposalEditable(proposal);

    if (isMemberOfProposal && isProposalEditable) {
      return true;
    }

    return false;
  }
}
