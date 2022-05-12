import {
  createSEPValidationSchema,
  updateSEPValidationSchema,
  assignSEPMembersValidationSchema,
  removeSEPMemberValidationSchema,
  assignSEPChairOrSecretaryValidationSchema,
  assignSEPMemberToProposalValidationSchema,
  updateTimeAllocationValidationSchema,
  saveSepMeetingDecisionValidationSchema,
} from '@user-office-software/duo-validation';
import { container, inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { ProposalPksWithNextStatus } from '../models/Proposal';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { SEP } from '../models/SEP';
import { SepMeetingDecision } from '../models/SepMeetingDecision';
import { UserWithRole, UserRole } from '../models/User';
import {
  UpdateMemberSEPArgs,
  AssignSepReviewersToProposalArgs,
  AssignReviewersToSEPArgs,
  RemoveSepReviewerFromProposalArgs,
  AssignChairOrSecretaryToSEPArgs,
} from '../resolvers/mutations/AssignMembersToSEP';
import {
  AssignProposalsToSepArgs,
  RemoveProposalsFromSepArgs,
} from '../resolvers/mutations/AssignProposalsToSep';
import { CreateSEPArgs } from '../resolvers/mutations/CreateSEPMutation';
import { ReorderSepMeetingDecisionProposalsInput } from '../resolvers/mutations/ReorderSepMeetingDecisionProposalsMutation';
import { SaveSEPMeetingDecisionInput } from '../resolvers/mutations/SEPMeetingDecisionMutation';
import { UpdateSEPArgs } from '../resolvers/mutations/UpdateSEPMutation';
import { UpdateSEPTimeAllocationArgs } from '../resolvers/mutations/UpdateSEPProposalMutation';
@injectable()
export default class SEPMutations {
  private proposalAuth = container.resolve(ProposalAuthorization);
  constructor(
    @inject(Tokens.SEPDataSource)
    private dataSource: SEPDataSource,
    @inject(Tokens.InstrumentDataSource)
    private instrumentDataSource: InstrumentDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.ProposalSettingsDataSource)
    private proposalSettingsDataSource: ProposalSettingsDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
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
        return rejection(
          'Could not create scientific evaluation panel',
          { agent },
          err
        );
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
        return rejection(
          'Could not update scientific evaluation panel',
          { agent },
          err
        );
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
      return rejection(
        'Can not assign to SEP, because only users with sep reviewer role can be chair or secretary',
        { args, agent }
      );
    }

    return this.dataSource
      .assignChairOrSecretaryToSEP(args.assignChairOrSecretaryToSEPInput)
      .catch((error) => {
        return rejection(
          'Could not assign chair and secretary to SEP',
          { agent },
          error
        );
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
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, args.sepId))
    ) {
      return rejection(
        'Could not assign member to SEP because of insufficient permissions',
        { agent, args }
      );
    }

    return this.dataSource.assignReviewersToSEP(args).catch((err) => {
      return rejection(
        'Could not assign member to SEP because of an error',
        { agent },
        err
      );
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
      agent,
      args.sepId
    );
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    if (!isUserOfficer && !isChairOrSecretaryOfSEP) {
      return rejection(
        'Could not remove member from SEP because of insufficient permissions',
        { agent, args }
      );
    }

    const sepMemberToRemoveRoles = await this.userDataSource.getUserRoles(
      args.memberId
    );

    // NOTE: Finding role by shortCode because it is not possible by id (args.roleId is of type UserRole and role is of type Role and they are not aligned).
    const sepMemberRoleToRemove = sepMemberToRemoveRoles.find(
      (role) => role.shortCode === UserRole[args.roleId].toLowerCase()
    );

    if (!sepMemberRoleToRemove) {
      return rejection(
        'Could not remove member from SEP because specified role not found on user',
        { agent, args }
      );
    }

    const isMemberToRemoveChairOrSecretaryOfSEP =
      await this.userAuth.isChairOrSecretaryOfSEP(
        {
          id: args.memberId,
          currentRole: sepMemberRoleToRemove,
        } as UserWithRole,
        args.sepId
      );

    // SEP Chair and SEP Secretary can not
    // modify SEP Chair and SEP Secretary members
    if (isChairOrSecretaryOfSEP && !isUserOfficer) {
      if (isMemberToRemoveChairOrSecretaryOfSEP) {
        return rejection(
          `Could not remove member from SEP because SEP Chair and 
           SEP Secretary can not modify SEP Chair and SEP Secretary members`,
          { agent, args }
        );
      }
    }

    return this.dataSource
      .removeMemberFromSEP(args, isMemberToRemoveChairOrSecretaryOfSEP)
      .catch((error) => {
        return rejection(
          'Could not remove member from scientific evaluation panel',
          { agent },
          error
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.PROPOSAL_SEP_SELECTED)
  async assignProposalsToSep(
    agent: UserWithRole | null,
    args: AssignProposalsToSepArgs
  ): Promise<ProposalPksWithNextStatus | Rejection> {
    return this.dataSource
      .assignProposalsToSep(args)
      .then(async (result) => {
        const nextProposalStatus =
          await this.proposalSettingsDataSource.getProposalNextStatus(
            args.proposals[0].primaryKey,
            Event.PROPOSAL_SEP_SELECTED
          );

        return new ProposalPksWithNextStatus(
          result.proposalPks,
          nextProposalStatus?.id,
          nextProposalStatus?.shortCode,
          nextProposalStatus?.name
        );
      })
      .catch((err) => {
        return rejection(
          'Could not assign proposal to scientific evaluation panel',
          { agent },
          err
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.SEP_PROPOSAL_REMOVED)
  async removeProposalsFromSep(
    agent: UserWithRole | null,
    args: RemoveProposalsFromSepArgs
  ): Promise<SEP | Rejection> {
    return this.dataSource
      .removeProposalsFromSep(args.proposalPks, args.sepId)
      .catch((err) => {
        return rejection(
          'Could not remove assigned proposal from scientific evaluation panel',
          { agent },
          err
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    { sepId }: { sepId: number }
  ): Promise<SEP | Rejection> {
    const sep = await this.dataSource.getSEP(sepId);

    if (!sep) {
      return rejection('Can not delete SEP because sep was not found', {
        sepId,
      });
    }

    try {
      const result = await this.dataSource.delete(sepId);

      return result;
    } catch (error) {
      // NOTE: We are explicitly casting error to { code: string } type because it is the easiest solution for now and because it's type is a bit difficult to determine because of knexjs not returning typed error message.
      if ((error as { code: string }).code === '23503') {
        return rejection(
          'Failed to delete SEP, because it has dependencies which need to be deleted first',
          { sepId },
          error
        );
      }

      return rejection('Failed to delete SEP', { sepId, agent }, error);
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
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, args.sepId))
    ) {
      return rejection(
        'Can not assign SEP reviewers to proposal because of insufficient permissions',
        { agent, args }
      );
    }

    return this.dataSource
      .assignMemberToSEPProposal(args.proposalPk, args.sepId, args.memberIds)
      .catch((err) => {
        return rejection(
          'Can not assign proposal to scientific evaluation panel',
          { agent },
          err
        );
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
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, args.sepId))
    ) {
      return rejection(
        'Can not remove member from SEP proposal because of insufficient permissions',
        { agent, args }
      );
    }

    return this.dataSource
      .removeMemberFromSepProposal(args.proposalPk, args.sepId, args.memberId)
      .catch((error) => {
        return rejection(
          'Can not remove member from SEP proposal because of an error',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(updateTimeAllocationValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_SECRETARY, Roles.SEP_CHAIR])
  async updateTimeAllocation(
    agent: UserWithRole | null,
    { sepId, proposalPk, sepTimeAllocation = null }: UpdateSEPTimeAllocationArgs
  ) {
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (
      !isUserOfficer &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, sepId))
    ) {
      return rejection(
        'Could not update the time allocation because of insufficient permissions',
        { agent, sepId, proposalPk }
      );
    }

    const isProposalInstrumentSubmitted =
      await this.instrumentDataSource.isProposalInstrumentSubmitted(proposalPk);

    if (isProposalInstrumentSubmitted && !isUserOfficer) {
      return rejection(
        'Could not update the time allocation because the instrument is submitted',
        { agent, sepId, proposalPk }
      );
    }

    return this.dataSource
      .updateTimeAllocation(sepId, proposalPk, sepTimeAllocation)
      .catch((err) => {
        return rejection(
          'Could not update SEP proposal time allocation',
          { agent, sepId, proposalPk, sepTimeAllocation },
          err
        );
      });
  }

  @ValidateArgs(saveSepMeetingDecisionValidationSchema, [
    'commentForUser',
    'commentForManagement',
  ])
  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  @EventBus(Event.PROPOSAL_SEP_MEETING_SAVED)
  async saveSepMeetingDecision(
    agent: UserWithRole | null,
    args: SaveSEPMeetingDecisionInput
  ): Promise<SepMeetingDecision | Rejection> {
    const isChairOrSecretaryOfProposal =
      await this.proposalAuth.isChairOrSecretaryOfProposal(
        agent,
        args.proposalPk
      );
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    if (!isChairOrSecretaryOfProposal && !isUserOfficer) {
      return rejection(
        'Can not save SEP meeting decision because of insufficient permissions',
        { agent, args }
      );
    }

    const proposal = await this.proposalDataSource.get(args.proposalPk);

    if (!proposal?.primaryKey) {
      return rejection(
        'Can not add SEP meeting decision to non existing proposal',
        { args }
      );
    }

    const submittedBy = args.submitted ? (agent as UserWithRole).id : null;

    return this.dataSource
      .saveSepMeetingDecision(args, submittedBy)
      .catch((err) => {
        return rejection(
          'Can not save SEP meeting decision because an error occurred',
          { agent },
          err
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.PROPOSAL_SEP_MEETING_REORDER)
  async reorderSepMeetingDecisionProposals(
    agent: UserWithRole | null,
    args: ReorderSepMeetingDecisionProposalsInput
  ): Promise<SepMeetingDecision | Rejection> {
    try {
      const allSepDecisions = await Promise.all(
        args.proposals.map((proposal) => {
          return this.dataSource.saveSepMeetingDecision(proposal);
        })
      );

      if (allSepDecisions.length !== args.proposals.length) {
        return rejection(
          'Can not reorder SEP meeting decision proposals because could not find all proposals',
          { args }
        );
      }

      return allSepDecisions[0];
    } catch (error) {
      return rejection('Something went wrong', { args, error });
    }
  }
}
