import { to } from 'await-to-js';

import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { ApplicationEvent } from '../events/applicationEvents';
import { EventBus } from '../events/eventBus';
import { Proposal } from '../models/Proposal';
import { ProposalStatus } from '../models/ProposalModel';
import { isMatchingConstraints } from '../models/ProposalModelFunctions';
import { User } from '../models/User';
import { rejection, Rejection } from '../rejection';
import { UpdateProposalFilesArgs } from '../resolvers/mutations/UpdateProposalFilesMutation';
import { UpdateProposalArgs } from '../resolvers/mutations/UpdateProposalMutation';
import { ILogger } from '../utils/Logger';
import { logger } from '../utils/Logger';
import { UserAuthorization } from '../utils/UserAuthorization';
import { Event } from '../events/event.enum';

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private templateDataSource: TemplateDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>,
    private logger: ILogger
  ) {}

  /* NOTE: User | null??? This should be solved differently.
  ** We are sending null from the tests to simulate not logged in user.
  ** This is not the way we should test if user is logged in or not.
  ** There should be an auth checker that handles those cases.
  */
  async create(agent: User | null): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection('NOT_LOGGED_IN');
        }

        // Check if there is an open call, if not reject
        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.dataSource.checkActiveCall())
        ) {
          return rejection('NO_ACTIVE_CALL_FOUND');
        }

        return this.dataSource
          .create(agent.id)
          .then(proposal => proposal)
          .catch(err => {
            logger.logException('Could not create proposal', err, { agent });

            return rejection('INTERNAL_ERROR');
          });
      },
      proposal => {
        return {
          type: Event.PROPOSAL_CREATED,
          proposal,
          loggedInUserId: agent ? agent.id : null,
        };
      }
    );
  }

  async update(
    agent: User,
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

    return this.eventBus.wrap<Proposal>(
      async () => {
        if (agent == null) {
          return rejection('NOT_LOGGED_IN');
        }

        // Get proposal information
        const proposal = await this.dataSource.get(id); //Hacky

        // Check if there is an open call, if not reject
        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.dataSource.checkActiveCall())
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
        if (
          (await this.userAuth.isUserOfficer(agent)) &&
          rankOrder !== undefined
        ) {
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

                return rejection('VALUE_CONSTRAINT_REJECTION');
              }
              await this.dataSource.updateAnswer(
                proposal!.id,
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
      },
      (proposal): ApplicationEvent => {
        return {
          type: Event.PROPOSAL_UPDATED,
          proposal,
          loggedInUserId: agent.id,
        };
      }
    );
  }

  async updateFiles(
    agent: User | null,
    args: UpdateProposalFilesArgs
  ): Promise<string[] | Rejection> {
    if (agent == null) {
      return rejection('NOT_LOGGED_IN');
    }
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

  async submit(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection('NOT_LOGGED_IN');
        }

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
      },
      proposal => {
        return {
          type: Event.PROPOSAL_SUBMITTED,
          proposal,
          loggedInUserId: agent ? agent.id : null,
        };
      }
    );
  }

  async delete(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection('NOT_LOGGED_IN');
    }

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
