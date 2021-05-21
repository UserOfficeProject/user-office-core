import {
  administrationProposalValidationSchema,
  createProposalValidationSchema,
  deleteProposalValidationSchema,
  proposalNotifyValidationSchema,
  submitProposalValidationSchema,
  updateProposalValidationSchema,
} from '@esss-swap/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import {
  Proposal,
  ProposalEndStatus,
  ProposalIdsWithNextStatus,
} from '../models/Proposal';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { SampleStatus } from '../models/Sample';
import { UserWithRole } from '../models/User';
import { AdministrationProposalArgs } from '../resolvers/mutations/AdministrationProposal';
import { ChangeProposalsStatusInput } from '../resolvers/mutations/ChangeProposalsStatusMutation';
import { CloneProposalInput } from '../resolvers/mutations/CloneProposalMutation';
import { UpdateProposalArgs } from '../resolvers/mutations/UpdateProposalMutation';
import { UserAuthorization } from '../utils/UserAuthorization';
import { CallDataSource } from './../datasources/CallDataSource';

@injectable()
export default class ProposalMutations {
  constructor(
    @inject(Tokens.ProposalDataSource)
    public proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.CallDataSource) private callDataSource: CallDataSource,
    @inject(Tokens.InstrumentDataSource)
    private instrumentDataSource: InstrumentDataSource,
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @ValidateArgs(createProposalValidationSchema)
  @Authorized()
  @EventBus(Event.PROPOSAL_CREATED)
  async create(
    agent: UserWithRole | null,
    { callId }: { callId: number }
  ): Promise<Proposal | Rejection> {
    // Check if there is an open call
    if (!(await this.callDataSource.checkActiveCall(callId))) {
      return rejection('Call is not active', { callId, agent });
    }

    const call = await this.callDataSource.get(callId);

    if (!call || !call.templateId) {
      return rejection(
        'Can not create proposal because there is problem with the call',
        { call }
      );
    }

    const questionary = await this.questionaryDataSource.create(
      (agent as UserWithRole).id,
      call.templateId
    );

    return this.proposalDataSource
      .create((agent as UserWithRole).id, callId, questionary.questionaryId)
      .then((proposal) => proposal)
      .catch((err) => {
        return rejection('Could not create proposal', { agent, call }, err);
      });
  }

  @ValidateArgs(updateProposalValidationSchema)
  @Authorized()
  @EventBus(Event.PROPOSAL_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateProposalArgs
  ): Promise<Proposal | Rejection> {
    const { id, title, abstract, users, proposerId } = args;

    // Get proposal information
    const proposal = await this.proposalDataSource.get(id); //Hacky

    if (!proposal) {
      return rejection('Proposal not found', { args });
    }

    // Check if the call is open
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.callDataSource.checkActiveCall(proposal.callId))
    ) {
      return rejection('Call is not active', { args });
    }

    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('Unauthorized proposal update', { args });
    }

    if (proposal.submitted && !this.userAuth.isUserOfficer(agent)) {
      return rejection('Can not update proposal after submission', { args });
    }

    if (title !== undefined) {
      proposal.title = title;
    }

    if (abstract !== undefined) {
      proposal.abstract = abstract;
    }

    if (users !== undefined) {
      this.proposalDataSource.setProposalUsers(id, users).catch((error) => {
        return rejection(
          'Could not update proposal co-proposers',
          { id, agent },
          error
        );
      });
    }

    if (proposerId !== undefined) {
      proposal.proposerId = proposerId;
    }

    return this.proposalDataSource.update(proposal).catch((err) => {
      return rejection('Could not update proposal', { agent, id }, err);
    });
  }

  @ValidateArgs(submitProposalValidationSchema)
  @Authorized()
  @EventBus(Event.PROPOSAL_SUBMITTED)
  async submit(
    agent: UserWithRole | null,
    { proposalId }: { proposalId: number }
  ): Promise<Proposal | Rejection> {
    const proposal = await this.proposalDataSource.get(proposalId);

    if (!proposal) {
      return rejection('Can not submit proposal, because proposal not found', {
        proposalId,
      });
    }

    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (
      !isUserOfficer &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('Unauthorized submission of the proposal', {
        agent,
        proposalId,
      });
    }

    // Check if there is an open call
    const hasActiveCall = await this.callDataSource.checkActiveCall(
      proposal.callId
    );
    if (!isUserOfficer && !hasActiveCall) {
      return rejection('Can not submit proposal because call is not active', {
        agent,
        proposalId,
      });
    }

    return this.proposalDataSource.submitProposal(proposalId).catch((error) => {
      return rejection(
        'Could not submit proposal',
        { agent, proposalId },
        error
      );
    });
  }

  @ValidateArgs(deleteProposalValidationSchema)
  @Authorized()
  async delete(
    agent: UserWithRole | null,
    { proposalId }: { proposalId: number }
  ): Promise<Proposal | Rejection> {
    const proposal = await this.proposalDataSource.get(proposalId);

    if (!proposal) {
      return rejection('Can not delete proposal because proposal not found', {
        agent,
        proposalId,
      });
    }

    if (!this.userAuth.isUserOfficer(agent)) {
      if (
        proposal.submitted ||
        !this.userAuth.isPrincipalInvestigatorOfProposal(agent, proposal)
      )
        return rejection(
          'Can not delete proposal because proposal is submitted',
          { agent, proposalId }
        );
    }

    try {
      const result = await this.proposalDataSource.deleteProposal(proposalId);

      return result;
    } catch (error) {
      if ('code' in error && error.code === '23503') {
        return rejection(
          'Failed to delete proposal because, it has dependencies which need to be deleted first',
          { proposal },
          error
        );
      }

      return rejection(
        'Failed to delete proposal',
        { agent, proposalId },
        error
      );
    }
  }

  @ValidateArgs(proposalNotifyValidationSchema)
  @EventBus(Event.PROPOSAL_NOTIFIED)
  @Authorized([Roles.USER_OFFICER])
  async notify(
    user: UserWithRole | null,
    { proposalId }: { proposalId: number }
  ): Promise<unknown> {
    const proposal = await this.proposalDataSource.get(proposalId);

    if (!proposal || proposal.notified || !proposal.finalStatus) {
      return rejection('Can not notify proposal', { proposal });
    }
    proposal.notified = true;
    const result = await this.proposalDataSource.update(proposal);

    return result || rejection('Can not notify proposal', { result });
  }

  @EventBus(Event.PROPOSAL_MANAGEMENT_DECISION_UPDATED)
  @ValidateArgs(administrationProposalValidationSchema, [
    'commentForUser',
    'commentForManagement',
  ])
  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async admin(
    agent: UserWithRole | null,
    args: AdministrationProposalArgs
  ): Promise<Proposal | Rejection> {
    const {
      id,
      finalStatus,
      statusId,
      commentForManagement,
      commentForUser,
      managementTimeAllocation,
      managementDecisionSubmitted,
    } = args;
    const isChairOrSecretaryOfProposal = await this.userAuth.isChairOrSecretaryOfProposal(
      agent,
      id
    );
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    if (!isChairOrSecretaryOfProposal && !isUserOfficer) {
      return rejection(
        'Can not administer proposal because of insufficient permissions',
        { args, agent }
      );
    }

    const proposal = await this.proposalDataSource.get(id);

    if (!proposal) {
      return rejection(
        'Can not administer proposal because proposal not found',
        { args, agent }
      );
    }

    const isProposalInstrumentSubmitted = await this.instrumentDataSource.isProposalInstrumentSubmitted(
      id
    );

    if (isProposalInstrumentSubmitted && !isUserOfficer) {
      return rejection(
        'Can not administer proposal because instrument is submitted',
        { args, agent }
      );
    }

    if (finalStatus !== undefined) {
      proposal.finalStatus = finalStatus;
    }

    if (proposal.statusId !== statusId && statusId) {
      /**
       * NOTE: Reset proposal events that are coming after given status.
       * For example if proposal had SEP_REVIEW status and we manually reset to FEASIBILITY_REVIEW then events like:
       * proposal_feasible, proposal_feasibility_review_submitted and proposal_sep_selected should be reset to false in the proposal_events table
       */
      await this.proposalDataSource.resetProposalEvents(
        proposal.id,
        proposal.callId,
        statusId
      );

      // NOTE: If status Draft re-open proposal for submission.
      if (statusId === 1) {
        proposal.submitted = false;
      }
    }

    if (statusId !== undefined) {
      proposal.statusId = statusId;
    }

    if (commentForUser !== undefined) {
      proposal.commentForUser = commentForUser;
    }

    if (commentForManagement !== undefined) {
      proposal.commentForManagement = commentForManagement;
    }

    if (managementTimeAllocation !== undefined) {
      proposal.managementTimeAllocation = managementTimeAllocation;
    }

    if (managementDecisionSubmitted !== undefined) {
      proposal.managementDecisionSubmitted = managementDecisionSubmitted;
    }

    const result = await this.proposalDataSource.update(proposal);

    return result || rejection('Can not administer proposal', { result });
  }

  @EventBus(Event.PROPOSAL_STATUS_UPDATED)
  @Authorized([Roles.USER_OFFICER])
  async changeProposalsStatus(
    agent: UserWithRole | null,
    args: ChangeProposalsStatusInput
  ): Promise<ProposalIdsWithNextStatus | Rejection> {
    const { statusId, proposals } = args;

    const result = await this.proposalDataSource.changeProposalsStatus(
      statusId,
      proposals.map((proposal) => proposal.id)
    );

    if (result.proposalIds.length === proposals.length) {
      await Promise.all(
        proposals.map((proposal) => {
          return this.proposalDataSource.resetProposalEvents(
            proposal.id,
            proposal.callId,
            statusId
          );
        })
      );
    }

    return result || rejection('Can not change proposal status', { result });
  }

  @Authorized()
  @EventBus(Event.PROPOSAL_CLONED)
  async clone(
    agent: UserWithRole | null,
    { callId, proposalToCloneId }: CloneProposalInput
  ): Promise<Proposal | Rejection> {
    const sourceProposal = await this.proposalDataSource.get(proposalToCloneId);

    if (!sourceProposal) {
      return rejection(
        'Can not clone proposal because source proposal does not exist',
        { proposalToCloneId }
      );
    }

    if (!(await this.userAuth.hasAccessRights(agent, sourceProposal))) {
      return rejection(
        'Can not clone proposal because of insufficient permissions',
        { sourceProposal, agent }
      );
    }

    // Check if there is an open call
    if (!(await this.callDataSource.checkActiveCall(callId))) {
      return rejection(
        'Can not clone proposal because the call is not active',
        { callId, agent, sourceProposal }
      );
    }

    const call = await this.callDataSource.get(callId);

    if (!call || !call.templateId) {
      return rejection(
        'Can not clone proposal because the call is invalid or misconfigured',
        { call }
      );
    }

    const sourceQuestionary = await this.questionaryDataSource.getQuestionary(
      sourceProposal.questionaryId
    );

    if (call.templateId !== sourceQuestionary?.templateId) {
      return rejection(
        'Can not clone proposal to a call whose template is different',
        { call, sourceQuestionary }
      );
    }

    try {
      let clonedProposal = await this.proposalDataSource.cloneProposal(
        sourceProposal,
        call
      );

      const clonedQuestionary = await this.questionaryDataSource.clone(
        sourceProposal.questionaryId
      );

      // if user clones the proposal then it is his/her,
      // but if userofficer, then it will belong to original proposer
      const proposerId = this.userAuth.isUserOfficer(agent)
        ? sourceProposal.proposerId
        : agent!.id;

      clonedProposal = await this.proposalDataSource.update({
        id: clonedProposal.id,
        title: `Copy of ${clonedProposal.title}`,
        abstract: clonedProposal.abstract,
        proposerId: proposerId,
        statusId: 1,
        created: new Date(),
        updated: new Date(),
        shortCode: clonedProposal.shortCode,
        finalStatus: ProposalEndStatus.UNSET,
        callId: callId,
        questionaryId: clonedQuestionary.questionaryId,
        commentForUser: '',
        commentForManagement: '',
        notified: false,
        submitted: false,
        referenceNumberSequence: 0,
        managementTimeAllocation: 0,
        managementDecisionSubmitted: false,
        technicalReviewAssignee: clonedProposal.technicalReviewAssignee,
      });

      const proposalUsers = await this.userDataSource.getProposalUsers(
        sourceProposal.id
      );
      await this.proposalDataSource.setProposalUsers(
        clonedProposal.id,
        proposalUsers.map((user) => user.id)
      );

      const proposalSamples = await this.sampleDataSource.getSamples({
        filter: { proposalId: sourceProposal.id },
      });

      for await (const sample of proposalSamples) {
        const clonedSample = await this.sampleDataSource.cloneSample(sample.id);
        await this.sampleDataSource.updateSample({
          sampleId: clonedSample.id,
          proposalId: clonedProposal.id,
          questionaryId: clonedSample.questionaryId,
          safetyComment: '',
          safetyStatus: SampleStatus.PENDING_EVALUATION,
          shipmentId: null,
        });
      }

      return clonedProposal;
    } catch (error) {
      return rejection('Could not cone proposal', { proposalToCloneId }, error);
    }
  }
}
