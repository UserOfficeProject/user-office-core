import { to } from 'await-to-js';

import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { EventBus, Authorized } from '../decorators';
import { Event } from '../events/event.enum';
import { Proposal } from '../models/Proposal';
import { ProposalStatus } from '../models/ProposalModel';
import { isMatchingConstraints } from '../models/ProposalModelFunctions';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { UpdateProposalFilesArgs } from '../resolvers/mutations/UpdateProposalFilesMutation';
import { UpdateProposalArgs } from '../resolvers/mutations/UpdateProposalMutation';
import { Logger, logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import { CallDataSource } from './../datasources/CallDataSource';

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private templateDataSource: TemplateDataSource,
    private callDataSource: CallDataSource,
    private userAuth: UserAuthorization,
    private logger: Logger
  ) {}

  @Authorized()
  @EventBus(Event.PROPOSAL_CREATED)
  async create(agent: User | null): Promise<Proposal | Rejection> {
    // Check if there is an open call, if not reject
    if (!(await this.userAuth.isUserOfficer(agent)) {
        return rejection('NOT_AUTHORIZED');
    }
    if( !(await this.dataSource.checkActiveCall())
    {
      return rejection('NO_ACTIVE_CALL_FOUND');
    }

const call = await this.callDataSource.get(callId);

        if (!call || !call.templateId) {
          logger.logError('User tried to create proposal on bad call', {
            call,
          });

          return rejection('NOT_FOUND');
        }
return this.dataSource
          .create(agent.id, callId, call.templateId)
          .then(proposal => proposal)
          .catch(err => {
            logger.logException('Could not create proposal', err, { agent });

  
        return rejection('INTERNAL_ERROR');
      });
  }

  @Authorized()
  @EventBus(Event.PROPOSAL_UPDATED)
  async update(
    agent: User | null,
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
      rankOrder,
      finalStatus,
    } = args;

    // Get proposal information
    const proposal = await this.dataSource.get(id); //Hacky

    // Check if there is an open call, if not reject
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.dataSource.checkActiveCall())
    ) {
      return rejection('NO_ACTIVE_CALL_FOUND');
    }

        if (!proposal) {
          return rejection('NOT_FOUND');
        }

        // Check if there is an open call, if not reject
        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.dataSource.checkActiveCall(proposal.callId))
        ) {
          return rejection('NO_ACTIVE_CALL_FOUND');
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
    if ((await this.userAuth.isUserOfficer(agent)) && rankOrder !== undefined) {
      proposal.rankOrder = rankOrder;
    }

    if (
      (await this.userAuth.isUserOfficer(agent)) &&
      finalStatus !== undefined
    ) {
      proposal.finalStatus = finalStatus;
    }

    if (users !== undefined) {
      const [err] = await to(this.dataSource.setProposalUsers(id, users));
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
          const templateField = await this.templateDataSource.getTemplateField(
            answer.proposal_question_id
          );
          if (!templateField) {
            return rejection('INTERNAL_ERROR');
          }
          if (
            !partialSave &&
            !isMatchingConstraints(answer.value, templateField)
          ) {
            this.logger.logError(
              'User provided value not matching constraint',
              { answer, templateField }
            );

        if (proposerId !== undefined) {
          proposal.proposerId = proposerId;
        }

        if (answers !== undefined) {
          for (const answer of answers) {
            if (answer.value !== undefined) {
              const questionRel = await this.templateDataSource.getQuestionRel(
                answer.proposal_question_id,
                proposal.templateId
              );
              if (!questionRel) {
                logger.logError('Could not find questionRel', {
                  proposalQuestionId: answer.proposal_question_id,
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
              await this.dataSource.updateAnswer(
                proposal?.id,
                answer.proposal_question_id,
                answer.value
              );
            }
          }
          await this.dataSource.updateAnswer(
            proposal?.id,
            answer.proposal_question_id,
            answer.value
          );
        }
      }
    }

    if (topicsCompleted !== undefined) {
      await this.dataSource.updateTopicCompletenesses(
        proposal.id,
        topicsCompleted
      );
    }

    return this.dataSource
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
    agent: User | null,
    args: UpdateProposalFilesArgs
  ): Promise<string[] | Rejection> {
    const { proposalId, questionId, files } = args;
    const proposal = await this.dataSource.get(proposalId);

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('NOT_ALLOWED');
    }

    await this.dataSource.deleteFiles(proposalId, questionId);

    return this.dataSource
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

  @Authorized()
  @EventBus(Event.PROPOSAL_SUBMITTED)
  async submit(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    const proposal = await this.dataSource.get(proposalId);

    if (!proposal) {
      return rejection('INTERNAL_ERROR');
    }

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('NOT_ALLOWED');
    }

    return this.dataSource
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

  @Authorized()
  async delete(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    const proposal = await this.dataSource.get(proposalId);

    if (!proposal) {
      return rejection('INTERNAL_ERROR');
    }

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection('NOT_ALLOWED');
    }

    const result = await this.dataSource.deleteProposal(proposalId);

    return result || rejection('INTERNAL_ERROR');
  }
}
