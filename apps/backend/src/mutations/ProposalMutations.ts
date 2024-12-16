import { logger } from '@user-office-software/duo-logger';
import {
  administrationProposalValidationSchema,
  createProposalScientistCommentValidationSchema,
  createProposalValidationSchema,
  deleteProposalScientistCommentValidationSchema,
  deleteProposalValidationSchema,
  proposalNotifyValidationSchema,
  submitProposalValidationSchema,
  updateProposalScientistCommentValidationSchema,
  updateProposalValidationSchema,
} from '@user-office-software/duo-validation';
import { container, inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { FapDataSource } from '../datasources/FapDataSource';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import ProposalInternalCommentsDataSource from '../datasources/postgres/ProposalInternalCommentsDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { TechniqueDataSource } from '../datasources/TechniqueDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Call } from '../models/Call';
import { Proposal, ProposalEndStatus, Proposals } from '../models/Proposal';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { AdministrationProposalArgs } from '../resolvers/mutations/AdministrationProposalMutation';
import { ChangeProposalsStatusInput } from '../resolvers/mutations/ChangeProposalsStatusMutation';
import { CloneProposalsInput } from '../resolvers/mutations/CloneProposalMutation';
import { CreateProposalScientistCommentArgs } from '../resolvers/mutations/CreateProposalScientistCommentMutation';
import { ImportProposalArgs } from '../resolvers/mutations/ImportProposalMutation';
import { UpdateProposalArgs } from '../resolvers/mutations/UpdateProposalMutation';
import { UpdateProposalScientistCommentArgs } from '../resolvers/mutations/UpdateProposalScientistCommentMutation';
import { ProposalScientistComment } from '../resolvers/types/ProposalView';
import { statusActionEngine } from '../statusActionEngine';
import { WorkflowEngineProposalType } from '../workflowEngine';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';
import { CallDataSource } from './../datasources/CallDataSource';
import { CloneUtils } from './../utils/CloneUtils';

@injectable()
export default class ProposalMutations {
  private proposalAuth = container.resolve(ProposalAuthorization);
  private cloneUtils = container.resolve(CloneUtils);
  constructor(
    @inject(Tokens.ProposalDataSource)
    public proposalDataSource: ProposalDataSource,
    @inject(Tokens.ProposalSettingsDataSource)
    public proposalSettingsDataSource: ProposalSettingsDataSource,
    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.CallDataSource) private callDataSource: CallDataSource,
    @inject(Tokens.InstrumentDataSource)
    private instrumentDataSource: InstrumentDataSource,
    @inject(Tokens.FapDataSource)
    private fapDataSource: FapDataSource,
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.GenericTemplateDataSource)
    private genericTemplateDataSource: GenericTemplateDataSource,
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource,
    @inject(Tokens.TechniqueDataSource)
    private techniqueDataSource: TechniqueDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalInternalCommentsDataSource)
    private proposalInternalCommentsDataSource: ProposalInternalCommentsDataSource
  ) {}

  @ValidateArgs(createProposalValidationSchema)
  @Authorized()
  @EventBus(Event.PROPOSAL_CREATED)
  async create(
    agent: UserWithRole | null,
    { callId }: { callId: number }
  ): Promise<Proposal | Rejection> {
    // Check if there is an open call
    const checkIfInternalCallActive = agent?.isInternalUser || false;
    if (
      await this.callDataSource.isCallEnded(callId, checkIfInternalCallActive)
    ) {
      return rejection('Call is not active', { callId, agent });
    }

    const call = await this.callDataSource.getCall(callId);

    if (!call || !call.templateId) {
      return rejection(
        'Can not create proposal because there is problem with the call',
        { call }
      );
    }

    return await this.createProposal({
      submitterId: (agent as UserWithRole).id,
      call,
    });
  }

  private async createProposal({
    submitterId,
    call,
  }: {
    submitterId: number;
    call: Call;
  }): Promise<Proposal | Rejection> {
    const questionary = await this.questionaryDataSource.create(
      submitterId,
      call.templateId
    );

    return this.proposalDataSource
      .create(submitterId, call.id, questionary.questionaryId)
      .then((proposal) => proposal)
      .catch((err) => {
        return rejection(
          'Could not create proposal',
          { submitterId, call },
          err
        );
      });
  }

  @ValidateArgs(updateProposalValidationSchema)
  @Authorized()
  @EventBus(Event.PROPOSAL_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateProposalArgs
  ): Promise<Proposal | Rejection> {
    const { proposalPk } = args;

    // Get proposal information
    const proposal = await this.proposalDataSource.get(proposalPk); //Hacky

    if (!proposal) {
      return rejection('Proposal not found', { args });
    }

    if ((await this.proposalAuth.hasWriteRights(agent, proposal)) === false) {
      return rejection('You do not have rights to update this proposal', {
        args,
      });
    }

    return await this.updateProposal(agent, { proposal, args });
  }

  private async updateProposal(
    agent: UserWithRole | null,
    { proposal, args }: { proposal: Proposal; args: UpdateProposalArgs }
  ): Promise<Proposal | Rejection> {
    const { proposalPk, title, abstract, users, proposerId, created } = args;

    if (title !== undefined) {
      proposal.title = title;
    }

    if (abstract !== undefined) {
      proposal.abstract = abstract;
    }

    if (created !== undefined) {
      proposal.created = created;
    }

    if (users !== undefined) {
      const allUsers = [proposerId, ...users];
      const uniqueUsers = new Set(allUsers);

      if (uniqueUsers.size !== allUsers.length) {
        const duplicateUser = allUsers.find(
          (user, index) => allUsers.indexOf(user) !== index
        );

        const errorContext = {
          primaryKey: proposalPk,
          pi: proposerId,
          cois: users,
          duplicateUser: duplicateUser,
        };

        logger.logError(
          'Could not update proposal due to duplicate user',
          errorContext
        );

        return rejection('Proposal contains a duplicate user', errorContext);
      }

      await this.proposalDataSource
        .setProposalUsers(proposalPk, users)
        .catch((error) => {
          return rejection(
            'Could not update proposal co-proposers',
            { primaryKey: proposalPk, agent },
            error
          );
        });
    }

    if (proposerId !== undefined) {
      proposal.proposerId = proposerId;
    }

    try {
      const updatedProposal = await this.proposalDataSource.update(proposal);
      logger.logInfo('User Updated Proposal Details:', {
        proposalId: proposal.proposalId,
        title: proposal.title,
        userId: proposal.proposerId,
      });

      return updatedProposal;
    } catch (err) {
      return rejection(
        'Could not update proposal',
        {
          agent,
          primaryKey: proposalPk,
          proposalId: proposal.proposalId,
          title: proposal.title,
          userId: proposal.proposerId,
        },
        err
      );
    }
  }

  @ValidateArgs(submitProposalValidationSchema)
  @Authorized()
  @EventBus(Event.PROPOSAL_SUBMITTED)
  async submit(
    agent: UserWithRole | null,
    { proposalPk }: { proposalPk: number }
  ): Promise<Proposal | Rejection> {
    const proposal = await this.proposalDataSource.get(proposalPk);

    if (!proposal) {
      return rejection('Can not submit proposal, because proposal not found', {
        proposalPk,
      });
    }

    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    const checkIsInternalActive = agent?.isInternalUser || false;
    if (
      !isUserOfficer &&
      !(await this.proposalAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('Unauthorized submission of the proposal', {
        agent,
        proposalPk,
      });
    }

    // Check if there is an open call
    const isCallEnded = await this.callDataSource.isCallEnded(
      proposal.callId,
      checkIsInternalActive
    );
    if (!isUserOfficer && isCallEnded) {
      return rejection('Can not submit proposal because call is not active', {
        agent,
        proposalPk,
      });
    }
    if (proposal.submitted) {
      return rejection('Proposal has been submitted already', {
        agent,
        proposal,
      });
    }

    return this.submitProposal(agent, proposal);
  }

  private async submitProposal(
    agent: UserWithRole | null,
    proposal: Proposal
  ): Promise<Proposal | Rejection> {
    //Added this because the rejection doesnt like proposal.primaryKey
    const proposalPk = proposal.primaryKey;

    try {
      const submitProposal =
        await this.proposalDataSource.submitProposal(proposalPk);
      logger.logInfo('User Submitted a Proposal:', {
        proposalId: proposal.proposalId,
        title: proposal.title,
        userId: proposal.proposerId,
      });

      return submitProposal;
    } catch (err: unknown) {
      return rejection(
        'Could not submit proposal',
        {
          agent,
          proposalPk,
          proposalId: proposal.proposalId,
          title: proposal.title,
          userId: proposal.proposerId,
        },
        err
      );
    }
  }

  @ValidateArgs(deleteProposalValidationSchema)
  @Authorized()
  @EventBus(Event.PROPOSAL_DELETED)
  async delete(
    agent: UserWithRole | null,
    { proposalPk }: { proposalPk: number }
  ): Promise<Proposal | Rejection> {
    const proposal = await this.proposalDataSource.get(proposalPk);

    if (!proposal) {
      return rejection('Can not delete proposal because proposal not found', {
        agent,
        proposalPk,
      });
    }

    if (
      !this.userAuth.isUserOfficer(agent) &&
      !this.userAuth.isApiToken(agent)
    ) {
      if (
        proposal.submitted ||
        !this.proposalAuth.isPrincipalInvestigatorOfProposal(agent, proposal)
      )
        return rejection(
          'Can not delete proposal because proposal is submitted',
          { agent, proposalPk }
        );
    }

    try {
      const result = await this.proposalDataSource.deleteProposal(proposalPk);

      return result;
    } catch (error) {
      // NOTE: We are explicitly casting error to { code: string } type because it is the easiest solution for now and because it's type is a bit difficult to determine because of knexjs not returning typed error message.
      if ((error as { code: string }).code === '23503') {
        return rejection(
          'Failed to delete proposal because, it has dependencies which need to be deleted first',
          { proposal },
          error
        );
      }

      return rejection(
        'Failed to delete proposal',
        { agent, proposalPk },
        error
      );
    }
  }

  @ValidateArgs(proposalNotifyValidationSchema)
  @EventBus(Event.PROPOSAL_NOTIFIED)
  @Authorized([Roles.USER_OFFICER])
  async notify(
    user: UserWithRole | null,
    { proposalPk }: { proposalPk: number }
  ): Promise<unknown> {
    const proposal = await this.proposalDataSource.get(proposalPk);

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
  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async admin(
    agent: UserWithRole | null,
    args: AdministrationProposalArgs
  ): Promise<Proposal | Rejection> {
    const {
      proposalPk: primaryKey,
      finalStatus,
      commentForManagement,
      commentForUser,
      managementTimeAllocations,
      managementDecisionSubmitted,
    } = args;
    const isChairOrSecretaryOfProposal =
      await this.proposalAuth.isChairOrSecretaryOfProposal(agent, primaryKey);
    const isUserOfficer = this.userAuth.isUserOfficer(agent);

    if (!isChairOrSecretaryOfProposal && !isUserOfficer) {
      return rejection(
        'Can not administer proposal because of insufficient permissions',
        { args, agent }
      );
    }

    const proposal = await this.proposalDataSource.get(primaryKey);

    if (!proposal) {
      return rejection(
        'Can not administer proposal because proposal not found',
        { args, agent }
      );
    }

    const isFapProposalInstrumentSubmitted =
      await this.fapDataSource.isFapProposalInstrumentSubmitted(primaryKey);

    if (isFapProposalInstrumentSubmitted && !isUserOfficer) {
      return rejection(
        'Can not administer proposal because instrument is submitted',
        { args, agent }
      );
    }

    if (finalStatus !== undefined) {
      proposal.finalStatus = finalStatus;
    }

    if (commentForUser !== undefined) {
      proposal.commentForUser = commentForUser;
    }

    if (commentForManagement !== undefined) {
      proposal.commentForManagement = commentForManagement;
    }

    if (managementTimeAllocations?.length) {
      await this.instrumentDataSource.updateProposalInstrumentTimeAllocation(
        proposal.primaryKey,
        managementTimeAllocations
      );
    }

    if (managementDecisionSubmitted !== undefined) {
      proposal.managementDecisionSubmitted = managementDecisionSubmitted;
    }

    const result = await this.proposalDataSource.update(proposal);

    return result || rejection('Can not administer proposal', { result });
  }

  @ValidateArgs(createProposalScientistCommentValidationSchema)
  @Authorized([Roles.INSTRUMENT_SCIENTIST, Roles.USER_OFFICER])
  async createProposalScientistComment(
    agent: UserWithRole | null,
    args: CreateProposalScientistCommentArgs
  ): Promise<ProposalScientistComment | Rejection> {
    const proposal = await this.proposalDataSource.get(args.proposalPk);

    if (!proposal) {
      return rejection(
        'Could not create proposal scientist comment because proposal not found',
        {
          agent,
          proposalPk: args.proposalPk,
        }
      );
    }

    return await this.proposalInternalCommentsDataSource
      .create(args)
      .catch((error) => {
        return rejection(
          'Could not create proposal scientist comment',
          { agent, args: args },
          error
        );
      });
  }

  @ValidateArgs(updateProposalScientistCommentValidationSchema)
  @Authorized([Roles.INSTRUMENT_SCIENTIST, Roles.USER_OFFICER])
  async updateProposalScientistComment(
    agent: UserWithRole | null,
    args: UpdateProposalScientistCommentArgs
  ): Promise<ProposalScientistComment | Rejection> {
    return await this.proposalInternalCommentsDataSource
      .update(args)
      .catch((error) => {
        return rejection(
          `Could not update proposal scientist comment: '${args.commentId}'`,
          { agent, args: args },
          error
        );
      });
  }

  @ValidateArgs(deleteProposalScientistCommentValidationSchema)
  @Authorized([Roles.INSTRUMENT_SCIENTIST, Roles.USER_OFFICER])
  async deleteProposalScientistComment(
    agent: UserWithRole | null,
    args: { commentId: number }
  ): Promise<ProposalScientistComment | Rejection> {
    return await this.proposalInternalCommentsDataSource
      .delete(args.commentId)
      .catch((error) => {
        return rejection(
          `Could not delete proposal scientist comment: '${args.commentId}'`,
          { agent, args: args },
          error
        );
      });
  }

  private async processProposalsStatusChange(
    agent: UserWithRole | null,
    args: ChangeProposalsStatusInput
  ): Promise<Proposals | Rejection> {
    const { statusId, proposalPks } = args;

    const result = await this.proposalDataSource.changeProposalsStatus(
      statusId,
      proposalPks.map((proposalPk) => proposalPk)
    );

    if (result.proposals.length === proposalPks.length) {
      const fullProposals = await Promise.all(
        proposalPks.map(async (proposalPk) => {
          const fullProposal = result.proposals.find(
            (updatedProposal) => updatedProposal.primaryKey === proposalPk
          );

          if (!fullProposal) {
            return null;
          }

          await this.proposalDataSource.resetProposalEvents(
            proposalPk,
            fullProposal.callId,
            statusId
          );

          const proposalWorkflow =
            await this.proposalSettingsDataSource.getProposalWorkflowByCall(
              fullProposal.callId
            );

          if (!proposalWorkflow) {
            return rejection(
              `No propsal workflow found for the specific proposal call with id: ${fullProposal.callId}`,
              {
                agent,
                args,
              }
            );
          }

          return {
            ...fullProposal,
            workflowId: proposalWorkflow.id,
          };
        })
      );

      const statusEngineReadyProposals = fullProposals.filter(
        (item): item is WorkflowEngineProposalType => !!item
      );

      // NOTE: After proposal status change we need to run the status engine and execute the actions on the selected status.
      statusActionEngine(statusEngineReadyProposals);
    } else {
      rejection('Could not change statuses to all of the selected proposals', {
        result,
      });
    }

    return result || rejection('Can not change proposal status', { result });
  }

  @EventBus(Event.PROPOSAL_STATUS_CHANGED_BY_USER)
  @Authorized([Roles.USER_OFFICER])
  async changeProposalsStatus(
    agent: UserWithRole | null,
    args: ChangeProposalsStatusInput
  ): Promise<Proposals | Rejection> {
    return this.processProposalsStatusChange(agent, args);
  }

  @EventBus(Event.PROPOSAL_STATUS_CHANGED_BY_USER)
  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async changeXpressProposalsStatus(
    agent: UserWithRole | null,
    args: ChangeProposalsStatusInput
  ): Promise<Proposals | Rejection> {
    if (
      agent?.currentRole?.shortCode === Roles.USER_OFFICER ||
      agent?.isApiAccessToken
    ) {
      return this.processProposalsStatusChange(agent, args);
    }

    const requesterContext = {
      requester: agent?.isApiAccessToken
        ? 'API key'
        : agent?.currentRole?.title,
      requesterUserId: agent?.id,
    };

    const proposals = await this.proposalDataSource.getProposalsByPks(
      args.proposalPks
    );

    const foundProposalPks = proposals.map((proposal) => proposal.primaryKey);
    const missingProposalPks = args.proposalPks.filter(
      (pk) => !foundProposalPks.includes(pk)
    );

    if (missingProposalPks.length > 0) {
      return rejection(
        'Could not change status of Xpress proposal(s): proposals not found',
        {
          missingProposalPks: missingProposalPks,
          ...requesterContext,
        }
      );
    }

    const allStatuses =
      await this.proposalSettingsDataSource.getAllProposalStatuses();

    for (const proposal of proposals) {
      const currentStatus = allStatuses.find(
        (ps) => ps.id === proposal.statusId
      );

      const newStatus = allStatuses.find((ps) => ps.id === args.statusId);

      const context = {
        currentStatus: currentStatus,
        newStatus: newStatus,
        proposalId: proposal.proposalId,
        ...requesterContext,
      };

      if (!currentStatus || !newStatus) {
        return rejection(
          'Could not change status of Xpress proposal(s): cannot determine statuses',
          context
        );
      }

      if (currentStatus.id === newStatus.id) {
        return rejection(
          'Could not change status of Xpress proposal(s): same status',
          context
        );
      }

      enum XpressStatus {
        DRAFT = 'DRAFT',
        SUBMITTED_LOCKED = 'SUBMITTED_LOCKED',
        UNDER_REVIEW = 'UNDER_REVIEW',
        APPROVED = 'APPROVED',
        UNSUCCESSFUL = 'UNSUCCESSFUL',
        FINISHED = 'FINISHED',
        EXPIRED = 'EXPIRED',
      }

      if (!(newStatus.shortCode in XpressStatus)) {
        return rejection(
          'Could not change status of Xpress proposal(s): forbidden new status',
          context
        );
      }

      if (
        newStatus.shortCode === XpressStatus.DRAFT ||
        newStatus.shortCode === XpressStatus.SUBMITTED_LOCKED ||
        newStatus.shortCode === XpressStatus.EXPIRED
      ) {
        return rejection(
          'Could not change status of Xpress proposal(s): forbidden new status',
          context
        );
      }

      const proposalInstruments =
        await this.instrumentDataSource.getInstrumentsByProposalPk(
          proposal.primaryKey
        );

      const isInstrumentAbsent = (proposalInstruments?.length ?? 0) === 0;

      const isCurrentlyDraft = currentStatus.shortCode === XpressStatus.DRAFT;
      const isCurrentlySubmitted =
        currentStatus.shortCode === XpressStatus.SUBMITTED_LOCKED;
      const isCurrentlyUnsuccessful =
        currentStatus.shortCode === XpressStatus.UNSUCCESSFUL;
      const isCurrentlyApproved =
        currentStatus.shortCode === XpressStatus.APPROVED;
      const isCurrentlyFinished =
        currentStatus.shortCode === XpressStatus.FINISHED;

      if (isCurrentlyDraft || isCurrentlyFinished || isCurrentlyUnsuccessful) {
        return rejection(
          'Could not change status of Xpress proposal(s): unmodifiable current status',
          context
        );
      }

      const shouldDisableUnderReview =
        isCurrentlyApproved || isCurrentlyUnsuccessful;

      const shouldDisableApproved = isCurrentlySubmitted || isInstrumentAbsent;

      const shouldDisableUnsuccessful = isCurrentlySubmitted;

      const shouldDisableFinished = !isCurrentlyApproved || isInstrumentAbsent;

      if (
        (newStatus.shortCode === XpressStatus.UNDER_REVIEW &&
          shouldDisableUnderReview) ||
        (newStatus.shortCode === XpressStatus.APPROVED &&
          shouldDisableApproved) ||
        (newStatus.shortCode === XpressStatus.UNSUCCESSFUL &&
          shouldDisableUnsuccessful) ||
        (newStatus.shortCode === XpressStatus.FINISHED && shouldDisableFinished)
      ) {
        return rejection(
          'Could not change status of Xpress proposal(s): forbidden status transition',
          context
        );
      }
    }

    return this.processProposalsStatusChange(agent, args);
  }

  @Authorized()
  async cloneProposals(
    agent: UserWithRole | null,
    { callId, proposalsToClonePk }: CloneProposalsInput
  ): Promise<(Proposal | Rejection)[]> {
    return Promise.all(
      proposalsToClonePk.map((proposalPk) => {
        return this.clone(agent, {
          callId: callId,
          proposalToClonePk: proposalPk,
        });
      })
    );
  }

  @Authorized()
  @EventBus(Event.PROPOSAL_CLONED)
  private async clone(
    agent: UserWithRole | null,
    { callId, proposalToClonePk }: { callId: number; proposalToClonePk: number }
  ): Promise<Proposal | Rejection> {
    const sourceProposal = await this.proposalDataSource.get(proposalToClonePk);

    if (!sourceProposal) {
      return rejection(
        'Can not clone proposal because source proposal does not exist',
        { proposalToClonePk }
      );
    }

    const canReadProposal = await this.proposalAuth.hasReadRights(
      agent,
      sourceProposal
    );

    if (canReadProposal === false) {
      return rejection(
        'Can not clone proposal because of insufficient permissions',
        { sourceProposal, agent }
      );
    }

    const checkIfInternalCallActive = agent?.isInternalUser || false;
    // Check if there is an open call
    if (
      await this.callDataSource.isCallEnded(callId, checkIfInternalCallActive)
    ) {
      return rejection('Cannot clone the proposal because the call has ended', {
        callId,
        agent,
        sourceProposal,
      });
    }

    const call = await this.callDataSource.getCall(callId);

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
        sourceProposal.questionaryId,
        true
      );

      // TODO: Check if we need to also clone the technical review when cloning the proposal.
      clonedProposal = await this.proposalDataSource.update({
        primaryKey: clonedProposal.primaryKey,
        title: `Copy of ${clonedProposal.title}`,
        abstract: clonedProposal.abstract,
        proposerId: sourceProposal.proposerId,
        statusId: 1,
        created: new Date(),
        updated: new Date(),
        proposalId: clonedProposal.proposalId,
        finalStatus: ProposalEndStatus.UNSET,
        callId: callId,
        questionaryId: clonedQuestionary.questionaryId,
        commentForUser: '',
        commentForManagement: '',
        notified: false,
        submitted: false,
        referenceNumberSequence: 0,
        managementDecisionSubmitted: false,
        submittedDate: null,
      });

      const proposalUsers = await this.userDataSource.getProposalUsers(
        sourceProposal.primaryKey
      );
      await this.proposalDataSource.setProposalUsers(
        clonedProposal.primaryKey,
        proposalUsers.map((user) => user.id)
      );

      const proposalSamples = await this.sampleDataSource.getSamples({
        filter: { proposalPk: sourceProposal.primaryKey },
      });

      for await (const sample of proposalSamples) {
        await this.cloneUtils.cloneSample(sample, {
          proposalPk: clonedProposal.primaryKey,
          shipmentId: null,
        });
      }

      const proposalGenericTemplates =
        await this.genericTemplateDataSource.getGenericTemplates(
          {
            filter: { proposalPk: sourceProposal.primaryKey },
          },
          agent
        );

      for await (const genericTemplate of proposalGenericTemplates) {
        const clonedGenericTemplate =
          await this.genericTemplateDataSource.cloneGenericTemplate(
            genericTemplate.id,
            true
          );
        await this.genericTemplateDataSource.updateGenericTemplate({
          genericTemplateId: clonedGenericTemplate.id,
          proposalPk: clonedProposal.primaryKey,
          questionaryId: clonedGenericTemplate.questionaryId,
        });
      }

      return clonedProposal;
    } catch (error) {
      return rejection(
        'Could not clone the proposal' + (error === null ? '' : ' ' + error),
        { proposalToClonePk },
        error
      );
    }
  }

  @Authorized([Roles.USER_OFFICER])
  async import(
    agent: UserWithRole | null,
    args: ImportProposalArgs
  ): Promise<Proposal | Rejection> {
    const {
      callId,
      submitterId,
      proposerId,
      referenceNumber,
      users: coiIds,
      created,
      submittedDate,
      techniqueIds,
      instrumentId,
    } = args;

    const submitter = await this.userDataSource.getUser(submitterId);

    if (submitter === null) {
      await this.userDataSource.ensureDummyUserExists(submitterId);
      logger.logInfo('Created dummy user for non-existent PI', { submitterId });
    }

    if (proposerId !== undefined) {
      const proposer = await this.userDataSource.getUser(proposerId);

      if (proposer === null) {
        await this.userDataSource.ensureDummyUserExists(proposerId);
        logger.logInfo('Created dummy user for non-existent PI', {
          proposerId,
        });
      }
    }

    if (coiIds != null) {
      // Batch up getting CoI details to check user existance.
      const coIs = await Promise.all(
        coiIds.map(async (user) => await this.userDataSource.getUser(user))
      );

      const missing = coiIds.filter(
        (u) => coIs.find((c) => c?.id === u) === undefined
      );

      if (missing.length > 0) {
        await Promise.all(
          missing.map(
            async (m) => await this.userDataSource.ensureDummyUserExists(m)
          )
        );

        logger.logInfo('Created dummy user for non-existent Co-Is', {
          missing,
        });
      }
    }

    const call = await this.callDataSource.getCall(callId);

    if (!call || !call.templateId) {
      return rejection(
        'Can not create proposal because there is problem with the call',
        { call }
      );
    }

    const proposal = await this.createProposal({ submitterId, call });

    if (proposal instanceof Rejection) {
      return rejection('Proposal creation rejected', {});
    }

    const updatedProposal = await this.updateProposal(agent, {
      proposal: proposal as Proposal,
      args: {
        proposalPk: proposal.primaryKey,
        ...args,
      },
    });

    if (updatedProposal instanceof Rejection) {
      return rejection('Unable to update proposal', {
        reason: updatedProposal,
      });
    }

    if (!submittedDate) {
      return rejection(
        'Can not create proposal because there was no submitted date specified',
        { call }
      );
    }

    const submittedProposal =
      await this.proposalDataSource.submitImportedProposal(
        proposal.primaryKey,
        referenceNumber,
        submittedDate
      );

    if (!submittedProposal) {
      return rejection('Could not submit proposal', {
        agent: agent,
        proposalPk: proposal.primaryKey,
        proposalId: proposal.proposalId,
        title: proposal.title,
        userId: proposal.proposerId,
      });
    }

    if (techniqueIds) {
      this.techniqueDataSource.assignProposalToTechniques(
        submittedProposal.primaryKey,
        techniqueIds
      );
    }

    if (instrumentId) {
      this.instrumentDataSource.assignProposalToInstrument(
        submittedProposal.primaryKey,
        instrumentId
      );
    }

    return submittedProposal;
  }
}
