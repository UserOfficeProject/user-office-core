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
import { AssignProposalsToFapsInput } from '../datasources/postgres/records';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { EventBus, ValidateArgs, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { Fap, FapProposal, FapReviewer } from '../models/Fap';
import { FapMeetingDecision } from '../models/FapMeetingDecision';
import { ProposalPks } from '../models/Proposal';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole, UserRole } from '../models/User';
import {
  UpdateMemberFapArgs,
  AssignReviewersToFapArgs,
  RemoveFapReviewerFromProposalArgs,
  AssignChairOrSecretaryToFapArgs,
  AssignFapReviewersToProposalsArgs,
} from '../resolvers/mutations/AssignMembersToFapMutation';
import {
  AssignProposalsToFapsArgs,
  AssignProposalsToFapsUsingCallInstrumentArgs,
  RemoveProposalsFromFapsArgs,
} from '../resolvers/mutations/AssignProposalsToFapsMutation';
import { CreateFapArgs } from '../resolvers/mutations/CreateFapMutation';
import {
  SaveFapMeetingDecisionInput,
  SubmitFapMeetingDecisionsInput,
} from '../resolvers/mutations/FapMeetingDecisionMutation';
import { ReorderFapMeetingDecisionProposalsInput } from '../resolvers/mutations/ReorderFapMeetingDecisionProposalsMutation';
import { SaveReviewerRankArg } from '../resolvers/mutations/SaveReviewerRankMutation';
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
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource
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
          'Could not create facility access panel',
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
        args.active,
        args.files
      )
      .catch((err) => {
        return rejection(
          'Could not update facility access panel',
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

    return this.dataSource.removeMemberFromFap(args).catch((error) => {
      return rejection(
        'Could not remove member from facility access panel',
        { agent },
        error
      );
    });
  }

  @Authorized([Roles.USER_OFFICER])
  async assignProposalsToFapUsingCallInstrument(
    agent: UserWithRole | null,
    args: AssignProposalsToFapsUsingCallInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.assignProposalsToFapsUsingCallInstrumentsInternal(agent, args);
  }

  async assignProposalsToFapsUsingCallInstrumentsInternal(
    agent: UserWithRole | null,
    args: AssignProposalsToFapsUsingCallInstrumentArgs
  ): Promise<boolean | Rejection> {
    const proposals = await this.proposalDataSource.getProposalsByPks(
      args.proposalPks
    );

    const callHasInstruments =
      await this.callDataSource.getCallHasInstrumentsByInstrumentIds(
        args.instrumentIds
      );

    const callIds = [...new Set(proposals.map((proposal) => proposal.callId))];

    for (const callId of callIds) {
      const fapInstruments = callHasInstruments
        .filter(
          (callHasInstrument) =>
            callHasInstrument.fapId && callHasInstrument.callId === callId
        )
        .map((callHasInstrument) => ({
          fapId: callHasInstrument.fapId,
          instrumentId: callHasInstrument.instrumentId,
        }));

      if (fapInstruments.length) {
        await this.assignProposalsToFapsInternal(agent, {
          proposalPks: proposals
            .filter((proposal) => proposal.callId === callId)
            .map((proposal) => proposal.primaryKey),
          fapInstruments: fapInstruments,
        });
      }
    }

    return true;
  }

  @Authorized([Roles.USER_OFFICER])
  async assignProposalsToFaps(
    agent: UserWithRole | null,
    args: AssignProposalsToFapsArgs
  ): Promise<ProposalPks | Rejection> {
    return this.assignProposalsToFapsInternal(agent, args);
  }

  @EventBus(Event.PROPOSAL_FAPS_SELECTED)
  async assignProposalsToFapsInternal(
    agent: UserWithRole | null,
    args: AssignProposalsToFapsArgs
  ): Promise<ProposalPks | Rejection> {
    if (!args.fapInstruments.length) {
      return rejection(
        'Proposal cannot be assigned to FAP without specifying the instrument and FAP',
        {
          agent,
        }
      );
    }

    const dataToInsert: AssignProposalsToFapsInput[] = [];

    for (const proposalPk of args.proposalPks) {
      const proposalAssignedInstruments =
        await this.instrumentDataSource.getInstrumentsByProposalPk(proposalPk);

      const fullProposal = await this.proposalDataSource.get(proposalPk);

      if (!fullProposal) {
        return rejection(`Proposal not found with id: ${proposalPk}`, {
          args,
        });
      }

      for (const fapInstrument of args.fapInstruments) {
        // NOTE: This doublechecks if the proposal is assigned to the instrument at all or have FAP selected.
        if (
          !proposalAssignedInstruments.find(
            (instrument) => instrument.id === fapInstrument.instrumentId
          ) ||
          !fapInstrument.fapId
        ) {
          continue;
        }

        const {
          instrumentHasProposalIds: [instrumentHasProposalId],
        } = await this.instrumentDataSource.getInstrumentHasProposals(
          fapInstrument.instrumentId,
          [proposalPk]
        );

        dataToInsert.push({
          call_id: fullProposal.callId,
          fap_id: fapInstrument.fapId,
          instrument_id: fapInstrument.instrumentId,
          proposal_pk: proposalPk,
          instrument_has_proposals_id: instrumentHasProposalId,
        });
      }
    }

    const result = await this.dataSource.assignProposalsToFaps(dataToInsert);

    if (result.proposalPks.length !== args.proposalPks.length) {
      return rejection('Could not assign proposal to facility access panel', {
        agent,
      });
    }

    return result;
  }

  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.PROPOSAL_FAPS_REMOVED)
  async removeProposalsFromFaps(
    agent: UserWithRole | null,
    args: RemoveProposalsFromFapsArgs
  ): Promise<FapProposal[] | Rejection> {
    if (!args.fapIds.length) {
      return rejection(
        'Proposals already removed from facility access panels',
        {}
      );
    }

    return this.dataSource.removeProposalsFromFaps(args).catch((err) => {
      return rejection(
        'Could not remove assigned proposals from facility access panel',
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
  async assignFapReviewersToProposals(
    agent: UserWithRole | null,
    args: AssignFapReviewersToProposalsArgs
  ): Promise<Fap | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfFap(agent, args.fapId))
    ) {
      return rejection(
        'Can not assign Fap reviewers to proposals because of insufficient permissions',
        { agent, args }
      );
    }

    const fapReviewAssignments = [];

    for (const assignment of args.assignments) {
      const fapProposal = await this.dataSource.getFapProposal(
        args.fapId,
        assignment.proposalPk
      );

      if (!fapProposal) {
        return rejection(
          'Can not assign member to review because of an error',
          { agent, args }
        );
      }

      const fapCall = await this.callDataSource.getCall(fapProposal.callId);

      if (!fapCall) {
        return rejection(
          'Can not assign member to review because of an error',
          { agent, args }
        );
      }

      const fapReviewQuestionary = await this.questionaryDataSource.create(
        assignment.memberId,
        fapCall.fapReviewTemplateId
      );

      fapReviewAssignments.push({
        ...assignment,
        fapProposalId: fapProposal.fapProposalId,
        questionaryId: fapReviewQuestionary.questionaryId,
      });
    }

    return Promise.all(fapReviewAssignments).then(
      (resolvedFapReviewAssignments) =>
        this.dataSource
          .assignMembersToFapProposals(resolvedFapReviewAssignments, args.fapId)
          .catch((err) => {
            return rejection(
              'Can not assign FAP reviewers to proposals',
              { agent },
              err
            );
          })
    );
  }

  async getReviewerWithMinNumReviews(
    reviewersAssignedReviewsMap: Map<FapReviewer, number>,
    pendingAssignments: Map<FapReviewer, FapProposal[]>,
    proposalPk: number,
    fapId: number
  ): Promise<FapReviewer> {
    let fapReviewerWithMinNumReviews = [
      ...reviewersAssignedReviewsMap.keys(),
    ][0];
    let minReviews = Number.MAX_VALUE;

    for (const fapReviewer of [...reviewersAssignedReviewsMap.keys()]) {
      const numReviews = reviewersAssignedReviewsMap.get(fapReviewer) ?? 0;
      const numPendingReviews = (pendingAssignments.get(fapReviewer) ?? [])
        .length;
      const totalReviews = numReviews + numPendingReviews;
      const isAssigned =
        (pendingAssignments.get(fapReviewer) ?? []).some(
          (fapProposal) => fapProposal.proposalPk === proposalPk
        ) ||
        (
          await this.dataSource.getFapProposalAssignments(
            fapId,
            proposalPk,
            fapReviewer.userId
          )
        ).length > 0;

      if (totalReviews < minReviews && !isAssigned) {
        minReviews = totalReviews;
        fapReviewerWithMinNumReviews = fapReviewer;
      }
    }

    return fapReviewerWithMinNumReviews;
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
    {
      fapId,
      proposalPk,
      fapTimeAllocation = null,
      instrumentId,
    }: UpdateFapTimeAllocationArgs
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

    const isFapProposalInstrumentSubmitted =
      await this.dataSource.isFapProposalInstrumentSubmitted(
        proposalPk,
        instrumentId
      );

    if (isFapProposalInstrumentSubmitted && !isUserOfficer) {
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

    const fapProposal = this.dataSource.getFapProposal(
      args.fapId,
      args.proposalPk,
      args.instrumentId
    );

    if (!fapProposal) {
      return rejection(
        'Can not save FAP meeting decision to non existing FAP proposal',
        { args }
      );
    }

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
    const [{ instrumentId, fapId, proposalPk }] = args.proposals;
    const proposal = await this.proposalDataSource.get(proposalPk);
    if (!proposal) {
      return rejection('Proposal not found', { args });
    }

    const fapProposals = await this.dataSource.getFapProposalsByInstrument(
      instrumentId,
      proposal.callId,
      { fapId }
    );

    if (fapProposals.every((fp) => fp.fapInstrumentMeetingSubmitted)) {
      return rejection(
        'FAP instrument for selected proposals is submitted and reordering is not allowed',
        { args }
      );
    }

    try {
      const allFapDecisions = await Promise.all(
        args.proposals.map(async (proposal) => {
          const fapProposal = await this.dataSource.getFapProposal(
            proposal.fapId,
            proposal.proposalPk,
            proposal.instrumentId
          );

          if (!fapProposal) {
            return rejection(
              'Can not save FAP meeting decision to non existing FAP proposal',
              { args }
            );
          }

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

  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async saveReviewerRank(
    agent: UserWithRole | null,
    args: SaveReviewerRankArg
  ): Promise<boolean | Rejection> {
    try {
      return await this.dataSource.setReviewerRank(
        args.proposalPk,
        args.reviewerId,
        args.rank
      );
    } catch (error) {
      return rejection('Something went wrong', { args, error });
    }
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async submitFapMeetings(
    agent: UserWithRole | null,
    args: SubmitFapMeetingDecisionsInput
  ) {
    return this.dataSource.submitFapMeetings(
      args.callId,
      args.fapId,
      agent?.id
    );
  }
}
