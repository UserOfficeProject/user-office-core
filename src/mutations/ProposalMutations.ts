import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { User } from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";
import { rejection, Rejection } from "../rejection";
import { Proposal } from "../models/Proposal";
import { Review } from "../models/Review";

// TODO: it is here much of the logic reside

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private userAuth: any,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async create(agent: User | null): Promise<Proposal | Rejection> {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return rejection("NOT_LOGGED_IN");
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
          !(await this.userAuth.isMemberOfProposal(agent, proposal)) &&
          proposal.status !== 0
        ) {
          return rejection("NOT_ALLOWED_PROPOSAL_SUBMITTED");
        }

        // Check what needs to be updated and update proposal object
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

  async submitReview(
    user: User | null,
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review | Rejection> {
    const result = await this.dataSource.submitReview(reviewID, comment, grade);
    return result || rejection("INTERNAL_ERROR");
  }
}
