import { ResourceId } from '@esss-swap/duo-localisation';
import { logger } from '@esss-swap/duo-logger';
import {
  administrationProposalValidationSchema,
  createProposalValidationSchema,
  deleteProposalValidationSchema,
  proposalNotifyValidationSchema,
  submitProposalValidationSchema,
  updateProposalValidationSchema,
} from '@esss-swap/duo-validation';
import { to } from 'await-to-js';
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
import { Roles } from '../models/Role';
import { SampleStatus } from '../models/Sample';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
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
    if (!(await this.proposalDataSource.checkActiveCall(callId))) {
      return rejection('NO_ACTIVE_CALL_FOUND');
    }

    const call = await this.callDataSource.get(callId);

    if (!call || !call.templateId) {
      logger.logError('User tried to create proposal on bad call', {
        call,
      });

      return rejection('NOT_FOUND');
    }

    const questionary = await this.questionaryDataSource.create(
      (agent as UserWithRole).id,
      call.templateId
    );

    return this.proposalDataSource
      .create((agent as UserWithRole).id, callId, questionary.questionaryId)
      .then((proposal) => proposal)
      .catch((err) => {
        logger.logException('Could not create proposal', err, { agent });

        return rejection('INTERNAL_ERROR');
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
      return rejection('NOT_FOUND');
    }

    // Check if the call is open
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.proposalDataSource.checkActiveCall(proposal.callId))
    ) {
      return rejection('NO_ACTIVE_CALL_FOUND');
    }

    // Check that proposal exist
    if (!proposal) {
      return rejection('INTERNAL_ERROR');
    }

    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('NOT_ALLOWED');
    }
    if (!(proposal.statusId.valueOf() == 14)) {
      if (proposal.submitted && !this.userAuth.isUserOfficer(agent)) {
        return rejection('NOT_ALLOWED_PROPOSAL_SUBMITTED');
      }
    }

    if (title !== undefined) {
      proposal.title = title;
    }

    if (abstract !== undefined) {
      proposal.abstract = abstract;
    }

    if (users !== undefined) {
      const [err] = await to(
        this.proposalDataSource.setProposalUsers(id, users)
      );
      if (err) {
        logger.logError('Could not update users', { err, id, agent });

        return rejection('INTERNAL_ERROR');
      }
    }

    if (proposerId !== undefined) {
      proposal.proposerId = proposerId;
    }

    return this.proposalDataSource
      .update(proposal)
      .then((proposal) => proposal)
      .catch((err) => {
        logger.logException('Could not update proposal', err, {
          agent,
          id,
        });

        return rejection('INTERNAL_ERROR');
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
      return rejection('INTERNAL_ERROR');
    }

    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.proposalDataSource
      .submitProposal(proposalId)
      .then((proposal) => proposal)
      .catch((e) => {
        logger.logException('Could not submit proposal', e, {
          agent,
          proposalId,
        });

        return rejection('INTERNAL_ERROR');
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
      return rejection('NOT_FOUND');
    }

    if (!this.userAuth.isUserOfficer(agent)) {
      if (
        proposal.submitted ||
        !this.userAuth.isPrincipalInvestigatorOfProposal(agent, proposal)
      )
        return rejection('NOT_ALLOWED');
    }

    try {
      const result = await this.proposalDataSource.deleteProposal(proposalId);

      await this.questionaryDataSource.delete(result.questionaryId);

      return result;
    } catch (e) {
      if ('code' in e && e.code === '23503') {
        return rejection(
          `Failed to delete proposal with ID "${proposal.shortCode}", it has dependencies which need to be deleted first` as ResourceId
        );
      }

      logger.logException('Failed to delete proposal', e, {
        agent,
        proposalId,
      });

      return rejection('INTERNAL_ERROR');
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
      return rejection('INTERNAL_ERROR');
    }
    proposal.notified = true;
    const result = await this.proposalDataSource.update(proposal);

    return result || rejection('INTERNAL_ERROR');
  }

  @EventBus(Event.PROPOSAL_MANAGEMENT_DECISION_UPDATED)
  @EventBus(Event.PROPOSAL_STATUS_CHANGED_BY_USER)
  @ValidateArgs(administrationProposalValidationSchema)
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
      agent!.id,
      id
    );
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    if (!isChairOrSecretaryOfProposal && !isUserOfficer) {
      return rejection('NOT_ALLOWED');
    }

    const proposal = await this.proposalDataSource.get(id);

    if (!proposal) {
      return rejection('INTERNAL_ERROR');
    }

    const isProposalInstrumentSubmitted = await this.instrumentDataSource.isProposalInstrumentSubmitted(
      id
    );

    if (isProposalInstrumentSubmitted && !isUserOfficer) {
      return rejection('NOT_ALLOWED');
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

    return result || rejection('INTERNAL_ERROR');
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

    return result || rejection('INTERNAL_ERROR');
  }

  @Authorized()
  @EventBus(Event.PROPOSAL_CLONED)
  async clone(
    agent: UserWithRole | null,
    { callId, proposalToCloneId }: CloneProposalInput
  ): Promise<Proposal | Rejection> {
    const sourceProposal = await this.proposalDataSource.get(proposalToCloneId);

    if (!sourceProposal) {
      logger.logError(
        'Could not clone proposal because source proposal does not exist',
        { proposalToCloneId }
      );

      return rejection('NOT_FOUND');
    }

    if (!(await this.userAuth.hasAccessRights(agent, sourceProposal))) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    // Check if there is an open call
    if (!(await this.proposalDataSource.checkActiveCall(callId))) {
      return rejection('NO_ACTIVE_CALL_FOUND');
    }

    const call = await this.callDataSource.get(callId);

    if (!call || !call.templateId) {
      logger.logError('User tried to clone proposal on bad call', {
        call,
      });

      return rejection('NOT_FOUND');
    }

    const sourceQuestionary = await this.questionaryDataSource.getQuestionary(
      sourceProposal.questionaryId
    );

    if (call.templateId !== sourceQuestionary?.templateId) {
      logger.logError(
        'Can not clone proposal to a call whose template is different',
        {
          call,
          sourceQuestionary,
        }
      );

      return rejection('INTERNAL_ERROR');
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
        managementTimeAllocation: 0,
        managementDecisionSubmitted: false,
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
          questionaryId: clonedQuestionary.questionaryId,
          safetyComment: '',
          safetyStatus: SampleStatus.PENDING_EVALUATION,
          shipmentId: null,
        });
      }

      return clonedProposal;
    } catch (e) {
      logger.logException('Could not cone proposal', e);

      return rejection('INTERNAL_ERROR');
    }
  }
}
