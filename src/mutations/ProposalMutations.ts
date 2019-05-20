import Proposal from "../models/Proposal";
import { ProposalDataSource } from "../repositories/ProposalInterface";
// TODO: we should probably create object typ here instead of the repository to make that more basic
// TODO: it is here much of the logic reside

export default class ProposalMutations {
  create(
    args: { abstract: string; status: number; users: Array<number> },
    dataSource: ProposalDataSource,
    messageBroker: any
  ) {
    messageBroker.sendMessage("Proposal Created");
    return dataSource.create(args.abstract, args.status, args.users);
  }

  accept(proposalID: number, dataSource: ProposalDataSource) {
    let userID = 1;

    if (userID !== 1) {
      return null;
    }
    return dataSource.acceptProposal(proposalID);
  }
}
