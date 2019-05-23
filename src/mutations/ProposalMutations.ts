import { ProposalDataSource } from "../datasources/ProposalDataSource";
import User from "../models/User";
import { EventBus } from "../events/eventBus";
import { ApplicationEvent } from "../events/applicationEvents";

// TODO: it is here much of the logic reside

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async create(
    agent: User | null,
    abstract: string,
    status: number,
    users: number[]
  ) {
    return this.eventBus.wrap(
      async () => {
        if (agent == null) {
          return null;
        }

        return this.dataSource.create(abstract, status, users);
      },
      proposal => {
        return { type: "PROPOSAL_ACCEPTED", proposal };
      }
    );
  }

  async accept(agent: User | null, proposalID: number) {
    if (agent == null) {
      return null;
    }

    if (!agent.roles.includes("User_Officer")) {
      return null;
    }

    return this.dataSource.acceptProposal(proposalID);
  }
}
