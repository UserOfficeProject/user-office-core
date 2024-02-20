import {
  updateFapValidationSchema,
  assignFapMembersValidationSchema,
  removeFapMemberValidationSchema,
  assignFapChairOrSecretaryValidationSchema,
  assignFapMemberToProposalValidationSchema,
  updateTimeAllocationValidationSchema,
  saveFapMeetingDecisionValidationSchema,
  createFapValidationSchema,
} from '@user-office-software/duo-validation';
import { container, inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { FapDataSource } from '../datasources/FapDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { Fap } from '../models/Fap';
import { FapMeetingDecision } from '../models/FapMeetingDecision';
import { ProposalPks } from '../models/Proposal';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole, UserRole } from '../models/User';
import {
  UpdateMemberFapArgs,
  AssignFapReviewersToProposalArgs,
  AssignReviewersToFapArgs,
  RemoveFapReviewerFromProposalArgs,
  AssignChairOrSecretaryToFapArgs,
} from '../resolvers/mutations/AssignMembersToFapMutation';
import {
  AssignProposalsToFapArgs,
  AssignProposalsToFapUsingCallInstrumentArgs,
  RemoveProposalsFromFapArgs,
} from '../resolvers/mutations/AssignProposalsToFapMutation';
import { CreateFapArgs } from '../resolvers/mutations/CreateFapMutation';
import { SaveFapMeetingDecisionInput } from '../resolvers/mutations/FapMeetingDecisionMutation';
import { ReorderFapMeetingDecisionProposalsInput } from '../resolvers/mutations/ReorderFapMeetingDecisionProposalsMutation';
import { UpdateFapArgs } from '../resolvers/mutations/UpdateFapMutation';
import { UpdateFapTimeAllocationArgs } from '../resolvers/mutations/UpdateFapProposalMutation';

@injectable()
export default class FapMutations {
  private proposalAuth = container.resolve(ProposalAuthorization);
  constructor(
    @inject(Tokens.FapDataSource)
    private dataSource: FapDataSource,
    @inject(Tokens.InstrumentDataSource)
    private instrumentDataSource: InstrumentDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.CallDataSource)
    private callDataSource: CallDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @ValidateArgs(createFapValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.FAP_CREATED)
  async create(
    agent: UserWithRole | null,
    args: CreateFapArgs
  ): Promise<Fap | Rejection> {
    return this.dataSource
      .create(
        args.code,
        args.description,
        args.numberRatingsRequired,
        args.gradeGuide,
        args.customGradeGuide,
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

  @ValidateArgs(updateFapValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.FAP_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateFapArgs
  ): Promise<Fap | Rejection> {
    return this.dataSource
      .update(
        args.id,
        args.code,
        args.description,
        args.numberRatingsRequired,
        args.gradeGuide,
        args.customGradeGuide,
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

  @ValidateArgs(assignFapChairOrSecretaryValidationSchema(UserRole))
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.FAP_MEMBERS_ASSIGNED)
  async assignChairOrSecretaryToFap(
    agent: UserWithRole | null,
    args: AssignChairOrSecretaryToFapArgs
  ): Promise<Fap | Rejection> {
    const userRoles = await this.userDataSource.getUserRoles(
      args.assignChairOrSecretaryToFapInput.userId
    );

    // only users with fap reviewer role can be chair or secretary
    const isFapReviewer = userRoles.some(
      (role) => role.shortCode === Roles.FAP_REVIEWER
    );
    if (!isFapReviewer) {
      return rejection(
        'Can not assign to Fap, because only users with fap reviewer role can be chair or secretary',
        { args, agent }
      );
    }

    return this.dataSource
      .assignChairOrSecretaryToFap(args.assignChairOrSecretaryToFapInput)
      .catch((error) => {
        return rejection(
          'Could not assign chair or secretary to Fap please ensure they have the correct roles',
          { agent },
          error
        );
      });
  }

  @ValidateArgs(assignFapMembersValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.FAP_SECRETARY, Roles.FAP_CHAIR])
  @EventBus(Event.FAP_MEMBERS_ASSIGNED)
  async assignReviewersToFap(
    agent: UserWithRole | null,
    args: AssignReviewersToFapArgs
  ): Promise<Fap | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, args.fapId))
    ) {
      return rejection(
        'Could not assign member to Fap because of insufficient permissions',
        { agent, args }
      );
    }

    return this.dataSource.assignReviewersToFap(args).catch((err) => {
      return rejection(
        'Could not assign member to Fap because of an error, please ensure all selected users have the correct role. ' +
          err.message,
        { agent },
        err
      );
    });
  }

  @ValidateArgs(removeFapMemberValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.FAP_SECRETARY, Roles.FAP_CHAIR])
  @EventBus(Event.FAP_MEMBER_REMOVED)
  async removeMemberFromFap(
    agent: UserWithRole | null,
    args: UpdateMemberFapArgs
  ): Promise<Fap | Rejection> {
    const isChairOrSecretaryOfFap = await this.userAuth.isChairOrSecretaryOfFap(
      agent,
      args.fapId
    );
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    if (!isUserOfficer && !isChairOrSecretaryOfFap) {
      return rejection(
        'Could not remove member from Fap because of insufficient permissions',
        { agent, args }
      );
    }

    const fapMemberToRemoveRoles = await this.userDataSource.getUserRoles(
      args.memberId
    );

    // NOTE: Finding role by shortCode because it is not possible by id (args.roleId is of type UserRole and role is of type Role and they are not aligned).
    const fapMemberRoleToRemove = fapMemberToRemoveRoles.find(
      (role) => role.shortCode === UserRole[args.roleId].toLowerCase()
    );

    if (!fapMemberRoleToRemove) {
      return rejection(
        'Could not remove member from Fap because specified role not found on user',
        { agent, args }
      );
    }

    const isMemberToRemoveChairOrSecretaryOfFap =
      await this.userAuth.isChairOrSecretaryOfFap(
        {
          id: args.memberId,
          currentRole: fapMemberRoleToRemove,
        } as UserWithRole,
        args.fapId
      );

    // Fap Chair and Fap Secretary can not
    // modify Fap Chair and Fap Secretary members
    if (isChairOrSecretaryOfFap && !isUserOfficer) {
      if (isMemberToRemoveChairOrSecretaryOfFap) {
        return rejection(
          `Could not remove member from Fap because Fap Chair and 
           Fap Secretary can not modify Fap Chair and Fap Secretary members`,
          { agent, args }
        );
      }
    }

    return this.dataSource
      .removeMemberFromFap(args, isMemberToRemoveChairOrSecretaryOfFap)
      .catch((error) => {
        return rejection(
          'Could not remove member from scientific evaluation panel',
          { agent },
          error
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async assignProposalsToFapUsingCallInstrument(
    agent: UserWithRole | null,
    args: AssignProposalsToFapUsingCallInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.assignProposalsToFapUsingCallInstrumentInternal(agent, args);
  }

  async assignProposalsToFapUsingCallInstrumentInternal(
    agent: UserWithRole | null,
    args: AssignProposalsToFapUsingCallInstrumentArgs
  ): Promise<boolean | Rejection> {
    const proposals = await this.proposalDataSource.getProposalsByPks(
      args.proposalPks
    );

    const callHasInstruments =
      await this.callDataSource.getCallHasInstrumentsByInstrumentId(
        args.instrumentId
      );

    const callIds = [...new Set(proposals.map((proposal) => proposal.callId))];
    for (const callId of callIds) {
      const callHasInstrument = callHasInstruments.find(
        (callHasInstrument) => callHasInstrument.callId === callId
      );
      if (callHasInstrument && callHasInstrument.fapId) {
        await this.assignProposalsToFapInternal(agent, {
          proposals: proposals
            .filter((proposal) => proposal.callId === callId)
            .map((proposal) => ({
              ...proposal,
              callId: callId,
            })),
          fapId: callHasInstrument.fapId,
        });
      }
    }

    return true;
  }

  @Authorized([Roles.USER_OFFICER])
  async assignProposalsToFap(
    agent: UserWithRole | null,
    args: AssignProposalsToFapArgs
  ): Promise<ProposalPks | Rejection> {
    return this.assignProposalsToFapInternal(agent, args);
  }

  @EventBus(Event.PROPOSAL_FAP_SELECTED)
  async assignProposalsToFapInternal(
    agent: UserWithRole | null,
    args: AssignProposalsToFapArgs
  ): Promise<ProposalPks | Rejection> {
    const result = await this.dataSource.assignProposalsToFap(args);

    if (result.proposalPks.length !== args.proposals.length) {
      return rejection(
        'Could not assign proposal to scientific evaluation panel',
        { agent }
      );
    }

    return result;
  }

  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.FAP_PROPOSAL_REMOVED)
  async removeProposalsFromFap(
    agent: UserWithRole | null,
    args: RemoveProposalsFromFapArgs
  ): Promise<Fap | Rejection> {
    return this.dataSource
      .removeProposalsFromFap(args.proposalPks, args.fapId)
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
    { fapId }: { fapId: number }
  ): Promise<Fap | Rejection> {
    const fap = await this.dataSource.getFap(fapId);

    if (!fap) {
      return rejection('Can not delete Fap because fap was not found', {
        fapId,
      });
    }

    try {
      const result = await this.dataSource.delete(fapId);

      return result;
    } catch (error) {
      // NOTE: We are explicitly casting error to { code: string } type because it is the easiest solution for now and because it's type is a bit difficult to determine because of knexjs not returning typed error message.
      if ((error as { code: string }).code === '23503') {
        return rejection(
          'Failed to delete Fap, because it has dependencies which need to be deleted first',
          { fapId },
          error
        );
      }

      return rejection('Failed to delete Fap', { fapId, agent }, error);
    }
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_SECRETARY, Roles.FAP_CHAIR])
  @EventBus(Event.FAP_MEMBER_ASSIGNED_TO_PROPOSAL)
  async assignFapReviewersToProposal(
    agent: UserWithRole | null,
    args: AssignFapReviewersToProposalArgs
  ): Promise<Fap | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, args.fapId))
    ) {
      return rejection(
        'Can not assign Fap reviewers to proposal because of insufficient permissions',
        { agent, args }
      );
    }

    return this.dataSource
      .assignMemberToFapProposal(args.proposalPk, args.fapId, args.memberIds)
      .catch((err) => {
        return rejection(
          'Can not assign proposal to scientific evaluation panel',
          { agent },
          err
        );
      });
  }

  @ValidateArgs(assignFapMemberToProposalValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.FAP_SECRETARY, Roles.FAP_CHAIR])
  @EventBus(Event.FAP_MEMBER_REMOVED_FROM_PROPOSAL)
  async removeMemberFromFapProposal(
    agent: UserWithRole | null,
    args: RemoveFapReviewerFromProposalArgs
  ): Promise<Fap | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, args.fapId))
    ) {
      return rejection(
        'Can not remove member from Fap proposal because of insufficient permissions',
        { agent, args }
      );
    }

    return this.dataSource
      .removeMemberFromFapProposal(args.proposalPk, args.fapId, args.memberId)
      .catch((error) => {
        return rejection(
          'Can not remove member from Fap proposal because of an error',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(updateTimeAllocationValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.FAP_SECRETARY, Roles.FAP_CHAIR])
  async updateTimeAllocation(
    agent: UserWithRole | null,
    { fapId, proposalPk, fapTimeAllocation = null }: UpdateFapTimeAllocationArgs
  ) {
    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (
      !isUserOfficer &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, fapId))
    ) {
      return rejection(
        'Could not update the time allocation because of insufficient permissions',
        { agent, fapId, proposalPk }
      );
    }

    const isProposalInstrumentSubmitted =
      await this.instrumentDataSource.isProposalInstrumentSubmitted(proposalPk);

    if (isProposalInstrumentSubmitted && !isUserOfficer) {
      return rejection(
        'Could not update the time allocation because the instrument is submitted',
        { agent, fapId, proposalPk }
      );
    }

    return this.dataSource
      .updateTimeAllocation(fapId, proposalPk, fapTimeAllocation)
      .catch((err) => {
        return rejection(
          'Could not update Fap proposal time allocation',
          { agent, fapId, proposalPk, fapTimeAllocation },
          err
        );
      });
  }

  @ValidateArgs(saveFapMeetingDecisionValidationSchema, [
    'commentForUser',
    'commentForManagement',
  ])
  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  @EventBus(Event.PROPOSAL_FAP_MEETING_SAVED)
  async saveFapMeetingDecision(
    agent: UserWithRole | null,
    args: SaveFapMeetingDecisionInput
  ): Promise<FapMeetingDecision | Rejection> {
    const isChairOrSecretaryOfProposal =
      await this.proposalAuth.isChairOrSecretaryOfProposal(
        agent,
        args.proposalPk
      );
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    if (!isChairOrSecretaryOfProposal && !isUserOfficer) {
      return rejection(
        'Can not save Fap meeting decision because of insufficient permissions',
        { agent, args }
      );
    }

    const proposal = await this.proposalDataSource.get(args.proposalPk);

    if (!proposal?.primaryKey) {
      return rejection(
        'Can not add Fap meeting decision to non existing proposal',
        { args }
      );
    }

    const submittedBy = args.submitted ? (agent as UserWithRole).id : null;

    return this.dataSource
      .saveFapMeetingDecision(args, submittedBy)
      .catch((err) => {
        return rejection(
          'Can not save Fap meeting decision because an error occurred',
          { agent },
          err
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.PROPOSAL_FAP_MEETING_REORDER)
  async reorderFapMeetingDecisionProposals(
    agent: UserWithRole | null,
    args: ReorderFapMeetingDecisionProposalsInput
  ): Promise<FapMeetingDecision | Rejection> {
    try {
      const allFapDecisions = await Promise.all(
        args.proposals.map((proposal) => {
          return this.dataSource.saveFapMeetingDecision(proposal);
        })
      );

      if (allFapDecisions.length !== args.proposals.length) {
        return rejection(
          'Can not reorder Fap meeting decision proposals because could not find all proposals',
          { args }
        );
      }

      return allFapDecisions[0];
    } catch (error) {
      return rejection('Something went wrong', { args, error });
    }
  }
}
