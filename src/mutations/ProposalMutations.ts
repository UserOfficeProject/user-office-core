import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { MessageBroker } from "../messageBroker";
import User from "../models/User";
// TODO: it is here much of the logic reside

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private messageBroker: MessageBroker
  ) {}

  async create(
    agent: User | null,
    abstract: string,
    status: number,
    users: number[]
  ) {
    if (agent == null) {
      return null;
    }

    this.messageBroker.sendMessage("Proposal Created");
    return this.dataSource.create(abstract, status, users);
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
