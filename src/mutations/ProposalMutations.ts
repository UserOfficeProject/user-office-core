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

import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AdministrationProposalArgs } from '../resolvers/mutations/AdministrationProposal';
import { CloneProposalInput } from '../resolvers/mutations/CloneProposalMutation';
import { UpdateProposalArgs } from '../resolvers/mutations/UpdateProposalMutation';
import { UserAuthorization } from '../utils/UserAuthorization';
import { CallDataSource } from './../datasources/CallDataSource';

export default class ProposalMutations {
  constructor(
    private proposalDataSource: ProposalDataSource,
    private questionaryDataSource: QuestionaryDataSource,
    private callDataSource: CallDataSource,
    private instrumentDataSource: InstrumentDataSource,
    private userAuth: UserAuthorization
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
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.proposalDataSource.checkActiveCall(proposal.callId))
    ) {
      return rejection('NO_ACTIVE_CALL_FOUND');
    }

    // Check that proposal exist
    if (!proposal) {
      return rejection('INTERNAL_ERROR');
    }

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('NOT_ALLOWED');
    }

    if (proposal.submitted && !(await this.userAuth.isUserOfficer(agent))) {
      return rejection('NOT_ALLOWED_PROPOSAL_SUBMITTED');
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
      !(await this.userAuth.isUserOfficer(agent)) &&
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

    if (!(await this.userAuth.isUserOfficer(agent))) {
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

  @EventBus(Event.PROPOSAL_MANAGEMENT_DECISION_SUBMITTED)
  @ValidateArgs(administrationProposalValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async admin(
    agent: UserWithRole | null,
    args: AdministrationProposalArgs
  ): Promise<Proposal | Rejection> {
    const {
      id,
      rankOrder,
      finalStatus,
      statusId,
      commentForManagement,
      commentForUser,
    } = args;
    const isChairOrSecretaryOfProposal = await this.userAuth.isChairOrSecretaryOfProposal(
      agent!.id,
      id
    );
    const isUserOfficer = await this.userAuth.isUserOfficer(agent);

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

    if (rankOrder !== undefined) {
      proposal.rankOrder = rankOrder;
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

    const result = await this.proposalDataSource.update(proposal);

    return result || rejection('INTERNAL_ERROR');
  }

  @Authorized()
  @EventBus(Event.PROPOSAL_CLONED)
  async clone(
    agent: UserWithRole | null,
    { callId, proposalToCloneId }: CloneProposalInput
  ): Promise<Proposal | Rejection> {
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

    return this.proposalDataSource
      .cloneProposal(
        (agent as UserWithRole).id,
        proposalToCloneId,
        callId,
        call.templateId
      )
      .then((proposal) => proposal)
      .catch((err) => {
        logger.logException('Could not clone proposal', err, { agent });

        return rejection('INTERNAL_ERROR');
      });
  }
}
