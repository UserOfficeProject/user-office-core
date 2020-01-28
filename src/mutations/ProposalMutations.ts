import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import { ProposalAnswer, ProposalStatus } from "../models/ProposalModel";
import { Proposal } from "../models/Proposal";
import { UserAuthorization } from "../utils/UserAuthorization";
import { ILogger } from "../utils/Logger";
import { isMatchingConstraints } from "../models/ProposalModelFunctions";
import { TemplateDataSource } from "../datasources/TemplateDataSource";
import { to } from "await-to-js";
import { logger } from "../utils/Logger";

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private templateDataSource: TemplateDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>,
    private logger: ILogger
  ) {}

  async create(agent: User | null): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection("NOT_LOGGED_IN");
        }

        // Check if there is an open call, if not reject
        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.dataSource.checkActiveCall())
        ) {
          return rejection("NO_ACTIVE_CALL_FOUND");
        }

        return this.dataSource
          .create(agent.id)
          .then(proposal => proposal)
          .catch(err => {
            logger.logException("Could not create proposal", err, { agent });
            return rejection("INTERNAL_ERROR");
          });
      },
      proposal => {
        return { type: "PROPOSAL_CREATED", proposal };
      }
    );
  }

  async update(
    agent: User | null,
    id: number,
    title?: string,
    abstract?: string,
    answers?: ProposalAnswer[],
    topicsCompleted?: number[],
    users?: number[],
    proposerId?: number,
    partialSave?: boolean,
    excellenceScore?: number,
    technicalScore?: number,
    safetyScore?: number
  ): Promise<Proposal | Rejection> {
    return this.eventBus.wrap<Proposal>(
      async () => {
        if (agent == null) {
          return rejection("NOT_LOGGED_IN");
        }

        // Get proposal information
        let proposal = await this.dataSource.get(id); //Hacky

        // Check if there is an open call, if not reject
        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.dataSource.checkActiveCall())
        ) {
          return rejection("NO_ACTIVE_CALL_FOUND");
        }

        // Check that proposal exist
        if (!proposal) {
          return rejection("INTERNAL_ERROR");
        }

        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.userAuth.isMemberOfProposal(agent, proposal))
        ) {
          return rejection("NOT_ALLOWED");
        }

        if (
          proposal.status !== ProposalStatus.DRAFT &&
          !(await this.userAuth.isUserOfficer(agent))
        ) {
          return rejection("NOT_ALLOWED_PROPOSAL_SUBMITTED");
        }

        if (title !== undefined) {
          proposal.title = title;
        }

        if (abstract !== undefined) {
          proposal.abstract = abstract;
        }

        if (
          (await this.userAuth.isUserOfficer(agent)) &&
          excellenceScore !== undefined
        ) {
          proposal.excellenceScore = excellenceScore;
        }

        if (
          (await this.userAuth.isUserOfficer(agent)) &&
          technicalScore !== undefined
        ) {
          proposal.technicalScore = technicalScore;
        }

        if (
          (await this.userAuth.isUserOfficer(agent)) &&
          safetyScore !== undefined
        ) {
          proposal.safetyScore = safetyScore;
        }

        if (users !== undefined) {
          const [err] = await to(this.dataSource.setProposalUsers(id, users));
          if (err) {
            logger.logError(`Could not update users`, { err, id, agent });
            return rejection("INTERNAL_ERROR");
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
                return rejection("INTERNAL_ERROR");
              }
              if (
                !partialSave &&
                !isMatchingConstraints(answer.value, templateField)
              ) {
                this.logger.logError(
                  "User provided value not matching constraint",
                  { answer, templateField }
                );
                return rejection("VALUE_CONSTRAINT_REJECTION");
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
            logger.logException("Could not update proposal", err, {
              agent,
              id
            });
            return rejection("INTERNAL_ERROR");
          });
      },
      proposal => {
        return { type: "PROPOSAL_UPDATED", proposal };
      }
    );
  }

  async updateFiles(
    agent: User | null,
    proposalId: number,
    questionId: string,
    files: string[]
  ): Promise<string[] | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    let proposal = await this.dataSource.get(proposalId);

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection("NOT_ALLOWED");
    }

    await this.dataSource.deleteFiles(proposalId, questionId);

    return this.dataSource
      .insertFiles(proposalId, questionId, files)
      .then(result => {
        return result;
      })
      .catch(err => {
        logger.logException("Could not update proposal files", err, {
          agent,
          proposalId,
          questionId,
          files
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async accept(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }
    return this.dataSource
      .acceptProposal(proposalId)
      .then(proposal => proposal)
      .catch(err => {
        logger.logException("Could not accept proposal", err, {
          agent,
          proposalId
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async reject(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }

    return this.dataSource
      .rejectProposal(proposalId)
      .then(proposal => proposal)
      .catch(err => {
        logger.logException("Could not reject proposal", err, {
          agent,
          proposalId
        });
        return rejection("INTERNAL_ERROR");
      });
  }

  async submit(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection("NOT_LOGGED_IN");
        }

        let proposal = await this.dataSource.get(proposalId);

        if (!proposal) {
          return rejection("INTERNAL_ERROR");
        }

        if (
          !(await this.userAuth.isUserOfficer(agent)) &&
          !(await this.userAuth.isMemberOfProposal(agent, proposal))
        ) {
          return rejection("NOT_ALLOWED");
        }

        return this.dataSource
          .submitProposal(proposalId)
          .then(proposal => proposal)
          .catch(e => {
            logger.logException("Could not submit proposal", e, {
              agent,
              proposalId
            });
            return rejection("INTERNAL_ERROR");
          });
      },
      proposal => {
        return { type: "PROPOSAL_SUBMITTED", proposal };
      }
    );
  }

  async delete(
    agent: User | null,
    proposalId: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    let proposal = await this.dataSource.get(proposalId);

    if (!proposal) {
      return rejection("INTERNAL_ERROR");
    }

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection("NOT_ALLOWED");
    }

    const result = await this.dataSource.deleteProposal(proposalId);
    return result || rejection("INTERNAL_ERROR");
  }
}
