import Proposal from "../models/Proposal";
import { ProposalDataSource } from "../datasources/ProposalDataSource";
import { MessageBroker } from "../messageBroker";
// TODO: it is here much of the logic reside

export default class ProposalMutations {
  constructor(
    private dataSource: ProposalDataSource,
    private messageBroker: MessageBroker
  ) {}

  create(abstract: string, status: number, users: number[]) {
    this.messageBroker.sendMessage("Proposal Created");
    return this.dataSource.create(abstract, status, users);
  }

  accept(proposalID: number, userRoles: string[]) {
    if (!userRoles.includes("User_Officer")) {
      return null;
    }
    return this.dataSource.acceptProposal(proposalID);
  }
}
