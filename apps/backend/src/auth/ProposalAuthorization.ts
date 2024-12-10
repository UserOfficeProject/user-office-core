import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { FapDataSource } from '../datasources/FapDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { ProposalStatusDefaultShortCodes } from '../models/ProposalStatus';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { Proposal } from '../resolvers/types/Proposal';
import { ProposalSettingsDataSource } from './../datasources/ProposalSettingsDataSource';
import { UserDataSource } from './../datasources/UserDataSource';
import { UserJWT } from './../models/User';
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
    @inject(Tokens.FapDataSource)
    private fapDataSource: FapDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.ProposalSettingsDataSource)
    private proposalSettingsDataSource: ProposalSettingsDataSource,
    @inject(Tokens.UserAuthorization) protected userAuth: UserAuthorization
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
    agent: UserJWT | null,
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
    agent: UserJWT | null,
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

    const fapsUserIsMemberOf =
      await this.fapDataSource.getUserFapsByRoleAndFapId(
        agent.id,
        agent.currentRole
      );

    const fapIdsUserIsMemberOf = fapsUserIsMemberOf.map((fap) => fap.id);

    return this.reviewDataSource
      .getUserReviews(fapIdsUserIsMemberOf, agent.id)
      .then((reviews) => {
        return reviews.some((review) => review.proposalPk === proposalPk);
      });
  }

  async isMemberOfFapProposal(agent: UserWithRole | null, proposalPk: number) {
    if (agent == null || !agent.id || !agent.currentRole) {
      return false;
    }

    const fapsUserIsMemberOf =
      await this.fapDataSource.getUserFapsByRoleAndFapId(
        agent.id,
        agent.currentRole
      );

    const fapIdsUserIsMemberOf = fapsUserIsMemberOf.map((fap) => fap.id);
    const faps = await this.fapDataSource.getFapsByProposalPk(proposalPk);
    const fapIds = faps.map((fap) => fap.id);

    return fapIds.some((id) => fapIdsUserIsMemberOf.includes(id));
  }

  async isScientistToProposal(agent: UserJWT | null, proposalPk: number) {
    if (agent == null || !agent.id) {
      return false;
    }

    return this.userDataSource
      .checkScientistToProposal(agent.id, proposalPk)
      .then((result) => {
        return result;
      });
  }

  async isInstrumentManagerToProposal(
    agent: UserJWT | null,
    proposalPk: number
  ) {
    if (agent == null || !agent.id) {
      return false;
    }

    return this.userDataSource
      .checkInstrumentManagerToProposal(agent.id, proposalPk)
      .then((result) => {
        return result;
      });
  }

  async isVisitorOfProposal(agent: UserWithRole, proposalPk: number) {
    return this.visitDataSource.isVisitorOfProposal(agent.id, proposalPk);
  }

  async isChairOrSecretaryOfProposal(
    agent: UserJWT | null,
    proposalPk: number
  ) {
    if (agent == null || !agent.id || !proposalPk) {
      return false;
    }

    return this.fapDataSource.isChairOrSecretaryOfProposal(
      agent.id,
      proposalPk
    );
  }

  async isInternalReviewer(agent: UserWithRole, proposalPk: number) {
    const technicalReviews =
      await this.reviewDataSource.getTechnicalReviews(proposalPk);

    const isInternalReviewerOnSomeTechnicalReview = technicalReviews
      ? (
          await Promise.all(
            technicalReviews.map(
              async (technicalReview) =>
                await this.userAuth.isInternalReviewerOnTechnicalReview(
                  agent,
                  technicalReview.id
                )
            )
          )
        ).some((value) => value)
      : false;

    return isInternalReviewerOnSomeTechnicalReview;
  }

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

    const currentRole = agent?.currentRole?.shortCode;

    let haveAccess = false;

    switch (currentRole) {
      case Roles.USER:
        haveAccess =
          (await this.isMemberOfProposal(agent, proposal)) ||
          (await this.isVisitorOfProposal(agent, proposal.primaryKey));
        break;
      case Roles.INSTRUMENT_SCIENTIST:
        haveAccess =
          (await this.isInstrumentManagerToProposal(
            agent,
            proposal.primaryKey
          )) || (await this.isScientistToProposal(agent, proposal.primaryKey));
        break;
      case Roles.INTERNAL_REVIEWER:
        haveAccess = await this.isInternalReviewer(agent, proposal.primaryKey);
        break;
      case Roles.FAP_REVIEWER:
      case Roles.FAP_SECRETARY:
      case Roles.FAP_CHAIR:
        haveAccess = await this.isMemberOfFapProposal(
          agent,
          proposal.primaryKey
        );
        break;
      default:
        break;
    }

    return (
      this.userAuth.isUserOfficer(agent) ||
      this.userAuth.isSampleSafetyReviewer(agent) ||
      this.userAuth.isInstrumentScientist(agent) ||
      this.userAuth.hasGetAccessByToken(agent) ||
      haveAccess
    );
  }

  private async isProposalEditable(
    proposal: Proposal,
    checkIfInternalEditable: boolean = false
  ): Promise<boolean> {
    const callId = proposal.callId;
    const isCallEnded = await this.callDataSource.isCallEnded(
      callId,
      checkIfInternalEditable
    );
    const proposalStatus = (
      await this.proposalSettingsDataSource.getProposalStatus(proposal.statusId)
    )?.shortCode;
    if (
      proposalStatus === ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED ||
      (checkIfInternalEditable &&
        proposalStatus ===
          ProposalStatusDefaultShortCodes.EDITABLE_SUBMITTED_INTERNAL)
    ) {
      return true;
    }

    if (isCallEnded) {
      return false;
    } else {
      return proposalStatus === ProposalStatusDefaultShortCodes.DRAFT;
    }
  }

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

    const checkIfInternalEditable = agent.isInternalUser || false;
    const isMemberOfProposal = await this.isMemberOfProposal(agent, proposal);
    const isProposalEditable = await this.isProposalEditable(
      proposal,
      checkIfInternalEditable
    );

    if (isMemberOfProposal && isProposalEditable) {
      return true;
    }

    return false;
  }
}
