import { ResourceId } from '@esss-swap/duo-localisation';
import { logger } from '@esss-swap/duo-logger';
import {
  createSEPValidationSchema,
  updateSEPValidationSchema,
  assignSEPMembersValidationSchema,
  removeSEPMemberValidationSchema,
  assignProposalToSEPValidationSchema,
  assignSEPChairOrSecretaryValidationSchema,
  assignSEPMemberToProposalValidationSchema,
  updateTimeAllocationValidationSchema,
  saveSepMeetingDecisionValidationSchema,
} from '@esss-swap/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { ProposalIdsWithNextStatus } from '../models/Proposal';
import { Roles } from '../models/Role';
import { SEP } from '../models/SEP';
import { SepMeetingDecision } from '../models/SepMeetingDecision';
import { UserWithRole, UserRole } from '../models/User';
import { rejection, Rejection, isRejection } from '../rejection';
import {
  UpdateMemberSEPArgs,
  AssignSepReviewersToProposalArgs,
  AssignReviewersToSEPArgs,
  RemoveSepReviewerFromProposalArgs,
  AssignChairOrSecretaryToSEPArgs,
} from '../resolvers/mutations/AssignMembersToSEP';
import { AssignProposalToSEPArgs } from '../resolvers/mutations/AssignProposalToSEP';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { ReorderSepMeetingDecisionProposalsInput } from '../resolvers/mutations/ReorderSepMeetingDecisionProposalsMutation';
import { SaveSEPMeetingDecisionInput } from '../resolvers/mutations/SEPMeetingDecisionMutation';
import { UpdateSEPArgs } from '../resolvers/mutations/UpdateSEPMutation';
import { UpdateSEPTimeAllocationArgs } from '../resolvers/mutations/UpdateSEPProposalMutation';
import { UserAuthorization } from '../utils/UserAuthorization';
@injectable()
export default class SEPMutations {
  constructor(
    @inject(Tokens.SEPDataSource)
    private dataSource: SEPDataSource,
    @inject(Tokens.InstrumentDataSource)
    private instrumentDataSource: InstrumentDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.ProposalSettingsDataSource)
    private proposalSettingsDataSource: ProposalSettingsDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource
  ) {}

  @ValidateArgs(createSEPValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_CREATED)
  async create(
    agent: UserWithRole | null,
    args: CreateSEPArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .create(
        args.code,
        args.description,
        args.numberRatingsRequired,
        args.active
      )
      .catch((err) => {
        logger.logException(
          'Could not create scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateSEPValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateSEPArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .update(
        args.id,
        args.code,
        args.description,
        args.numberRatingsRequired,
        args.active
      )
      .catch((err) => {
        logger.logException(
          'Could not update scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignSEPChairOrSecretaryValidationSchema(UserRole))
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_MEMBERS_ASSIGNED)
  async assignChairOrSecretaryToSEP(
    agent: UserWithRole | null,
    args: AssignChairOrSecretaryToSEPArgs
  ): Promise<SEP | Rejection> {
    const userRoles = await this.userDataSource.getUserRoles(
      args.assignChairOrSecretaryToSEPInput.userId
    );

    // only users with sep reviewer role can be chair or secretary
    const isSepReviewer = userRoles.some(
      (role) => role.shortCode === Roles.SEP_REVIEWER
    );
    if (!isSepReviewer) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .assignChairOrSecretaryToSEP(args.assignChairOrSecretaryToSEPInput)
      .catch((err) => {
        logger.logException(
          'Could not assign chair and secretary to scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignSEPMembersValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBERS_ASSIGNED)
  async assignReviewersToSEP(
    agent: UserWithRole | null,
    args: AssignReviewersToSEPArgs
  ): Promise<SEP | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, args.sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource.assignReviewersToSEP(args).catch((err) => {
      logger.logException(
        'Could not assign member to scientific evaluation panel',
        err,
        { agent }
      );

      return rejection('INTERNAL_ERROR');
    });
  }

  @ValidateArgs(removeSEPMemberValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBER_REMOVED)
  async removeMemberFromSEP(
    agent: UserWithRole | null,
    args: UpdateMemberSEPArgs
  ): Promise<SEP | Rejection> {
    const isChairOrSecretaryOfSEP = await this.userAuth.isChairOrSecretaryOfSEP(
      agent!.id,
      args.sepId
    );
    const isUserOfficer = await this.userAuth.isUserOfficer(agent);

    if (!isUserOfficer && !isChairOrSecretaryOfSEP) {
      return rejection('NOT_ALLOWED');
    }

    const isMemberChairOrSecretaryOfSEP = await this.userAuth.isChairOrSecretaryOfSEP(
      args.memberId,
      args.sepId
    );

    // SEP Chair and SEP Secretary can not
    // modify SEP Chair and SEP Secretary members
    if (isChairOrSecretaryOfSEP && !isUserOfficer) {
      if (isMemberChairOrSecretaryOfSEP) {
        return rejection('NOT_ALLOWED');
      }
    }

    return this.dataSource
      .removeMemberFromSEP(args, isMemberChairOrSecretaryOfSEP)
      .catch((err) => {
        logger.logException(
          'Could not remove member from scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignProposalToSEPValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.PROPOSAL_SEP_SELECTED)
  async assignProposalToSEP(
    agent: UserWithRole | null,
    args: AssignProposalToSEPArgs
  ): Promise<ProposalIdsWithNextStatus | Rejection> {
    const SEP = await this.dataSource.getSEPByProposalId(args.proposalId);
    if (SEP) {
      if (
        isRejection(
          await this.removeProposalAssignment(agent, {
            proposalId: args.proposalId,
            sepId: SEP.id,
          })
        )
      ) {
        return rejection('INTERNAL_ERROR');
      }
    }

    return this.dataSource
      .assignProposal(args.proposalId, args.sepId)
      .then(async (result) => {
        const nextProposalStatus = await this.proposalSettingsDataSource.getProposalNextStatus(
          args.proposalId,
          Event.PROPOSAL_SEP_SELECTED
        );

        return new ProposalIdsWithNextStatus(
          result.proposalIds,
          nextProposalStatus?.id,
          nextProposalStatus?.shortCode,
          nextProposalStatus?.name
        );
      })
      .catch((err) => {
        logger.logException(
          'Could not assign proposal to scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignProposalToSEPValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_PROPOSAL_REMOVED)
  async removeProposalAssignment(
    agent: UserWithRole | null,
    args: AssignProposalToSEPArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .removeProposalAssignment(args.proposalId, args.sepId)
      .catch((err) => {
        logger.logException(
          'Could not remove assigned proposal from scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    { sepId }: { sepId: number }
  ): Promise<SEP | Rejection> {
    const sep = await this.dataSource.get(sepId);

    if (!sep) {
      return rejection('NOT_FOUND');
    }

    try {
      const result = await this.dataSource.delete(sepId);

      return result;
    } catch (e) {
      if ('code' in e && e.code === '23503') {
        return rejection(
          `Failed to delete SEP with ID "${sep.code}", it has dependencies which need to be deleted first` as ResourceId
        );
      }

      logger.logException('Failed to delete SEP', e, {
        agent,
        sepId,
      });

      return rejection('INTERNAL_ERROR');
    }
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBER_ASSIGNED_TO_PROPOSAL)
  async assignSepReviewersToProposal(
    agent: UserWithRole | null,
    args: AssignSepReviewersToProposalArgs
  ): Promise<SEP | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, args.sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .assignMemberToSEPProposal(args.proposalId, args.sepId, args.memberIds)
      .catch((err) => {
        logger.logException(
          'Could not assign proposal to scientific evaluation panel',
          err,
          { agent }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(assignSEPMemberToProposalValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  @EventBus(Event.SEP_MEMBER_REMOVED_FROM_PROPOSAL)
  async removeMemberFromSepProposal(
    agent: UserWithRole | null,
    args: RemoveSepReviewerFromProposalArgs
  ): Promise<SEP | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(
        (agent as UserWithRole).id,
        args.sepId
      ))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .removeMemberFromSepProposal(args.proposalId, args.sepId, args.memberId)
      .catch((err) => {
        logger.logException('Could not remove member from SEP proposal', err, {
          agent,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateTimeAllocationValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  async updateTimeAllocation(
    agent: UserWithRole | null,
    { sepId, proposalId, sepTimeAllocation = null }: UpdateSEPTimeAllocationArgs
  ) {
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (
      !isUserOfficer &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent!.id, sepId))
    ) {
      return rejection('NOT_ALLOWED');
    }

    const isProposalInstrumentSubmitted = await this.instrumentDataSource.isProposalInstrumentSubmitted(
      proposalId
    );

    if (isProposalInstrumentSubmitted && !isUserOfficer) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
      .updateTimeAllocation(sepId, proposalId, sepTimeAllocation)
      .catch((err) => {
        logger.logException(
          'Could not update SEP proposal time allocation',
          err,
          {
            agent,
            sepId,
            proposalId,
            sepTimeAllocation,
          }
        );

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(saveSepMeetingDecisionValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  @EventBus(Event.PROPOSAL_SEP_MEETING_SAVED)
  async saveSepMeetingDecision(
    agent: UserWithRole | null,
    args: SaveSEPMeetingDecisionInput
  ): Promise<SepMeetingDecision | Rejection> {
    const isChairOrSecretaryOfProposal = await this.userAuth.isChairOrSecretaryOfProposal(
      agent!.id,
      args.proposalId
    );
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    if (!isChairOrSecretaryOfProposal && !isUserOfficer) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    const proposal = await this.proposalDataSource.get(args.proposalId);

    if (!proposal?.id) {
      logger.logError(
        'Cannot add SEP meeting decision to non existing proposal',
        {
          args,
        }
      );

      return rejection('NOT_FOUND');
    }

    const submittedBy = args.submitted ? (agent as UserWithRole).id : null;

    return this.dataSource
      .saveSepMeetingDecision(args, submittedBy)
      .catch((err) => {
        logger.logException('Could not save sep meeting decision', err, {
          agent,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.PROPOSAL_SEP_MEETING_REORDER)
  async reorderSepMeetingDecisionProposals(
    agent: UserWithRole | null,
    args: ReorderSepMeetingDecisionProposalsInput
  ): Promise<SepMeetingDecision | Rejection> {
    const allSepDecisions = await Promise.all(
      args.proposals.map((proposal) => {
        return this.dataSource.saveSepMeetingDecision(proposal);
      })
    );

    if (allSepDecisions.length !== args.proposals.length) {
      return rejection('NOT_FOUND');
    }

    return allSepDecisions[0];
  }
}
