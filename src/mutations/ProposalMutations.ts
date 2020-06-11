import {
  createProposalValidationSchema,
  updateProposalValidationSchema,
  submitProposalValidationSchema,
  deleteProposalValidationSchema,
  proposalNotifyValidationSchema,
  administrationProposalBEValidationSchema,
} from '@esss-swap/duo-validation';
import { to } from 'await-to-js';

import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { EventBus, Authorized, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { ProposalStatus } from '../models/ProposalModel';
import { isMatchingConstraints } from '../models/ProposalModelFunctions';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { AdministrationProposalArgs } from '../resolvers/mutations/AdministrationProposal';
import { UpdateProposalFilesArgs } from '../resolvers/mutations/UpdateProposalFilesMutation';
import { UpdateProposalArgs } from '../resolvers/mutations/UpdateProposalMutation';
import { Logger, logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import { CallDataSource } from './../datasources/CallDataSource';

export default class ProposalMutations {
  constructor(
    private proposalDataSource: ProposalDataSource,
    private templateDataSource: TemplateDataSource,
    private callDataSource: CallDataSource,
    private userAuth: UserAuthorization,
    private logger: Logger
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

    return this.proposalDataSource
      .create(agent!.id, callId, call.templateId)
      .then(proposal => proposal)
      .catch(err => {
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
    const {
      id,
      title,
      abstract,
      answers,
      topicsCompleted,
      users,
      proposerId,
      partialSave,
    } = args;

    // Get proposal information
    const proposal = await this.proposalDataSource.get(id); //Hacky

    if (!proposal) {
      return rejection('NOT_FOUND');
    }

    // Check if there is an open call, if not reject
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

    if (
      proposal.status !== ProposalStatus.DRAFT &&
      !(await this.userAuth.isUserOfficer(agent))
    ) {
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

    if (answers !== undefined) {
      for (const answer of answers) {
        if (answer.value !== undefined) {
          const questionRel = await this.templateDataSource.getQuestionRel(
            answer.proposalQuestionId,
            proposal.templateId
          );
          if (!questionRel) {
            logger.logError('Could not find questionRel', {
              proposalQuestionId: answer.proposalQuestionId,
              templateId: proposal.templateId,
            });

            return rejection('INTERNAL_ERROR');
          }
          if (
            !partialSave &&
            !isMatchingConstraints(answer.value, questionRel)
          ) {
            this.logger.logError(
              'User provided value not matching constraint',
              { answer, templateField: questionRel }
            );

            return rejection('VALUE_CONSTRAINT_REJECTION');
          }
          await this.proposalDataSource.updateAnswer(
            proposal?.id,
            answer.proposalQuestionId,
            answer.value
          );
        }
      }
    }

    if (topicsCompleted !== undefined) {
      await this.proposalDataSource.updateTopicCompletenesses(
        proposal.id,
        topicsCompleted
      );
    }

    return this.proposalDataSource
      .update(proposal)
      .then(proposal => proposal)
      .catch(err => {
        logger.logException('Could not update proposal', err, {
          agent,
          id,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized()
  async updateFiles(
    agent: UserWithRole | null,
    args: UpdateProposalFilesArgs
  ): Promise<string[] | Rejection> {
    const { proposalId, questionId, files } = args;
    const proposal = await this.proposalDataSource.get(proposalId);

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('NOT_ALLOWED');
    }

    await this.proposalDataSource.deleteFiles(proposalId, questionId);

    return this.proposalDataSource
      .insertFiles(proposalId, questionId, files)
      .then(result => {
        return result;
      })
      .catch(err => {
        logger.logException('Could not update proposal files', err, {
          agent,
          args,
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
      .then(proposal => proposal)
      .catch(e => {
        logger.logException('Could not submit proposal', e, {
          agent,
          proposalId,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(deleteProposalValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    { proposalId }: { proposalId: number }
  ): Promise<Proposal | Rejection> {
    const proposal = await this.proposalDataSource.get(proposalId);

    if (!proposal) {
      return rejection('INTERNAL_ERROR');
    }

    const result = await this.proposalDataSource.deleteProposal(proposalId);

    return result || rejection('INTERNAL_ERROR');
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

  @ValidateArgs(administrationProposalBEValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async admin(
    agent: UserWithRole | null,
    args: AdministrationProposalArgs
  ): Promise<Proposal | Rejection> {
    const {
      id,
      rankOrder,
      finalStatus,
      status,
      commentForManagement,
      commentForUser,
    } = args;
    const proposal = await this.proposalDataSource.get(id);

    if (!proposal) {
      return rejection('INTERNAL_ERROR');
    }
    if (rankOrder !== undefined) {
      proposal.rankOrder = rankOrder;
    }

    if (finalStatus !== undefined) {
      proposal.finalStatus = finalStatus;
    }

    if (status !== undefined) {
      proposal.status = status;
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
}
