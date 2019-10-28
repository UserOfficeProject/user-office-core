import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import { ProposalAnswer } from "../models/ProposalModel";
import { Proposal } from "../models/Proposal";
import { UserAuthorization } from "../utils/UserAuthorization";
import { ILogger } from "../utils/Logger";

// TODO: it is here much of the logic reside

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
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

        const result = await this.dataSource.create(agent.id);
        return result || rejection("INTERNAL_ERROR");
      },
      proposal => {
        return { type: "PROPOSAL_CREATED", proposal };
      }
    );
  }

  async update(
    agent: User | null,
    id: string,
    title?: string,
    abstract?: string,
    answers?: ProposalAnswer[],
    topicsCompleted?: number[],
    status?: number,
    users?: number[]
  ): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection("NOT_LOGGED_IN");
        }

        // Get proposal information
        let proposal = await this.dataSource.get(parseInt(id)); //Hacky

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
          (await this.userAuth.isMemberOfProposal(agent, proposal)) &&
          proposal.status !== 0
        ) {
          return rejection("NOT_ALLOWED_PROPOSAL_SUBMITTED");
        }

        if (title !== undefined) {
          proposal.title = title;

          if (title.length < 10) {
            return rejection("TOO_SHORT_TITLE");
          }
        }

        if (abstract !== undefined) {
          proposal.abstract = abstract;

          if (abstract.length < 20) {
            return rejection("TOO_SHORT_ABSTRACT");
          }
        }

        if (status !== undefined) {
          proposal.status = status;
        }

        if (users !== undefined) {
          const resultUpdateUsers = await this.dataSource.setProposalUsers(
            parseInt(id),
            users
          );
          if (!resultUpdateUsers) {
            return rejection("INTERNAL_ERROR");
          }
        }
        // This will overwrite the whole proposal with the new object created

        if (answers !== undefined) {
          // TODO validate input
          // if(<condition not matched>) { return rejection("<INVALID_VALUE_REASON>"); }
          answers.forEach(async answer => {
            if (answer.value !== undefined) {
              await this.dataSource.updateAnswer(
                proposal!.id,
                answer.proposal_question_id,
                answer.value
              );
            }
          });
        }

        if (topicsCompleted !== undefined) {
          await this.dataSource.updateTopicCompletenesses(
            proposal.id,
            topicsCompleted
          );
        }

        const result = await this.dataSource.update(proposal);

        return result || rejection("INTERNAL_ERROR");
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

    const result = await this.dataSource.insertFiles(
      proposalId,
      questionId,
      files
    );

    return result || rejection("INTERNAL_ERROR");
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
    const result = await this.dataSource.acceptProposal(proposalId);
    return result || rejection("INTERNAL_ERROR");
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

    const result = await this.dataSource.rejectProposal(proposalId);
    return result || rejection("INTERNAL_ERROR");
  }

  async submit(
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

    const result = await this.dataSource.submitProposal(proposalId);
    return result || rejection("INTERNAL_ERROR");
  }

  async delete(agent: User | null, proposalId: number) {
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
