import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import { Proposal, ProposalAnswer } from "../models/Proposal";
import { UserAuthorization } from "../utils/UserAuthorization";

// TODO: it is here much of the logic reside

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>
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
    answers:ProposalAnswer[],
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

        answers.forEach(async answer => {
          // TODO validate input
          // if(<condition not matched>) { return rejection("<INVALID_VALUE_REASON>"); }
          if(answer.answer !== undefined) {
            await this.dataSource.updateAnswer(
              proposal!.id,
              answer.proposal_question_id,
              answer.answer
            );
          }
        })

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
        const result = await this.dataSource.update(proposal);

        return result || rejection("INTERNAL_ERROR");
      },
      proposal => {
        return { type: "PROPOSAL_UPDATED", proposal };
      }
    );
  }

  async accept(
    agent: User | null,
    proposalID: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }
    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }
    const result = await this.dataSource.acceptProposal(proposalID);
    return result || rejection("INTERNAL_ERROR");
  }

  async reject(
    agent: User | null,
    proposalID: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    if (!(await this.userAuth.isUserOfficer(agent))) {
      return rejection("NOT_USER_OFFICER");
    }

    const result = await this.dataSource.rejectProposal(proposalID);
    return result || rejection("INTERNAL_ERROR");
  }

  async submit(
    agent: User | null,
    proposalID: number
  ): Promise<Proposal | Rejection> {
    if (agent == null) {
      return rejection("NOT_LOGGED_IN");
    }

    let proposal = await this.dataSource.get(proposalID);

    if (!proposal) {
      return rejection("INTERNAL_ERROR");
    }

    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isMemberOfProposal(agent, proposal))
    ) {
      return rejection("NOT_ALLOWED");
    }

    const result = await this.dataSource.submitProposal(proposalID);
    return result || rejection("INTERNAL_ERROR");
  }
}
