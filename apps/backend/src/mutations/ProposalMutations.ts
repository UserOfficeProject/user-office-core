import { logger } from '@user-office-software/duo-logger';
import {
  administrationProposalValidationSchema,
  createProposalValidationSchema,
  deleteProposalValidationSchema,
  proposalNotifyValidationSchema,
  submitProposalValidationSchema,
  updateProposalValidationSchema,
} from '@user-office-software/duo-validation';
import { container, inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { GenericTemplateDataSource } from '../datasources/GenericTemplateDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { resolveApplicationEventBus } from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { Call } from '../models/Call';
import { Proposal, ProposalEndStatus, Proposals } from '../models/Proposal';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { SampleStatus } from '../models/Sample';
import { UserWithRole } from '../models/User';
import { AdministrationProposalArgs } from '../resolvers/mutations/AdministrationProposalMutation';
import { ChangeProposalsStatusInput } from '../resolvers/mutations/ChangeProposalsStatusMutation';
import { CloneProposalsInput } from '../resolvers/mutations/CloneProposalMutation';
import { ImportProposalArgs } from '../resolvers/mutations/ImportProposalMutation';
import { UpdateProposalArgs } from '../resolvers/mutations/UpdateProposalMutation';
import { statusActionEngine } from '../statusActionEngine';
import { WorkflowEngineProposalType } from '../workflowEngine';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';
import { CallDataSource } from './../datasources/CallDataSource';
import { CloneUtils } from './../utils/CloneUtils';

@injectable()
export default class ProposalMutations {
  private proposalAuth = container.resolve(ProposalAuthorization);
  private cloneUtils = container.resolve(CloneUtils);
  private eventBus = resolveApplicationEventBus();
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
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.GenericTemplateDataSource)
    private genericTemplateDataSource: GenericTemplateDataSource,
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
    const { proposalPk, title, abstract, users, proposerId } = args;

    if (title !== undefined) {
      proposal.title = title;
    }

    if (abstract !== undefined) {
      proposal.abstract = abstract;
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
    proposal: Proposal,
    legacyReferenceNumber?: string
  ): Promise<Proposal | Rejection> {
    //Added this because the rejection doesnt like proposal.primaryKey
    const proposalPk = proposal.primaryKey;

    try {
      const submitProposal = await this.proposalDataSource.submitProposal(
        proposalPk,
        legacyReferenceNumber
      );
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
  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async admin(
    agent: UserWithRole | null,
    args: AdministrationProposalArgs
  ): Promise<Proposal | Rejection> {
    const {
      proposalPk: primaryKey,
      finalStatus,
      commentForManagement,
      commentForUser,
      managementTimeAllocation,
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

    const isProposalInstrumentSubmitted =
      await this.instrumentDataSource.isProposalInstrumentSubmitted(primaryKey);

    if (isProposalInstrumentSubmitted && !isUserOfficer) {
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

    if (managementTimeAllocation !== undefined) {
      proposal.managementTimeAllocation = managementTimeAllocation;
    }

    if (managementDecisionSubmitted !== undefined) {
      proposal.managementDecisionSubmitted = managementDecisionSubmitted;
    }

    const result = await this.proposalDataSource.update(proposal);

    return result || rejection('Can not administer proposal', { result });
  }

  // @EventBus(Event.PROPOSAL_STATUS_CHANGED_BY_USER)
  @Authorized([Roles.USER_OFFICER])
  async changeProposalsStatus(
    agent: UserWithRole | null,
    args: ChangeProposalsStatusInput
  ): Promise<Proposals | Rejection> {
    const { statusId, proposals } = args;

    const proposalsBeforeUpdate =
      await this.proposalDataSource.getProposalsByIds(
        proposals.map((proposal) => proposal.primaryKey)
      );

    const result = await this.proposalDataSource.changeProposalsStatus(
      statusId,
      proposals.map((proposal) => proposal.primaryKey)
    );

    if (result.proposals.length === proposals.length) {
      const fullProposals = await Promise.all(
        proposals.map(async (proposal) => {
          await this.proposalDataSource.resetProposalEvents(
            proposal.primaryKey,
            proposal.callId,
            statusId
          );

          const fullProposal = result.proposals.find(
            (updatedProposal) =>
              updatedProposal.primaryKey === proposal.primaryKey
          );

          if (!fullProposal) {
            return null;
          }

          return {
            ...fullProposal,
            workflowId: proposal.workflowId,
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

    if (!result) {
      return rejection('Can not change proposal status', { result });
    }

    Promise.all(
      result.proposals.map(async (updatedProposal) => {
        const proposalStatus =
          await this.proposalSettingsDataSource.getProposalStatus(
            updatedProposal.statusId
          );
        const foundProposalBeforeUpdate = proposalsBeforeUpdate.find(
          (proposal) => proposal.primaryKey === updatedProposal.primaryKey
        );
        const previousProposalStatus = foundProposalBeforeUpdate
          ? await this.proposalSettingsDataSource.getProposalStatus(
              foundProposalBeforeUpdate.statusId
            )
          : null;

        const messageDescription = `From status: "${previousProposalStatus?.name}" to status: "${proposalStatus?.name}"`;

        const event = {
          type: Event.PROPOSAL_STATUS_CHANGED_BY_USER,
          proposal: updatedProposal,
          key: 'proposal',
          loggedInUserId: null,
          isRejection: false,
          description: messageDescription,
        } as ApplicationEvent;

        this.eventBus
          .publish(event)
          .catch((e) =>
            logger.logError(`EventBus publish failed ${event.type}`, e)
          );
      })
    );

    return result;
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
      return rejection(
        'Can not clone proposal because the call is not active',
        { callId, agent, sourceProposal }
      );
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
        managementTimeAllocation: 0,
        managementDecisionSubmitted: false,
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
          safetyStatus: SampleStatus.PENDING_EVALUATION,
          safetyComment: '',
          shipmentId: null,
        });
      }

      const proposalGenericTemplates =
        await this.genericTemplateDataSource.getGenericTemplates({
          filter: { proposalPk: sourceProposal.primaryKey },
        });

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
        'Could not clone the proposal',
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

    const submitted = await this.submitProposal(
      agent,
      updatedProposal,
      referenceNumber
    );

    return submitted;
  }
}
