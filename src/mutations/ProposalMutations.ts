import Proposal from "../models/Proposal";
import { ProposalDataSource } from "../repositories/ProposalInterface";
// TODO: it is here much of the logic reside

export default class ProposalMutations {
  create(
    args: { abstract: string; status: number; users: number[] },
    dataSource: ProposalDataSource,
    messageBroker: any
  ) {
    messageBroker.sendMessage("Proposal Created");
    return dataSource.create(args.abstract, args.status, args.users);
  }

  accept(
    proposalID: number,
    dataSource: ProposalDataSource,
    userRoles: string[]
  ) {
    if (!userRoles.includes("User_Officer")) {
      return null;
    }
    return dataSource.acceptProposal(proposalID);
  }
}
