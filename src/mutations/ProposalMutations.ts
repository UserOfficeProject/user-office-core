import Proposal from "../models/Proposal";

// TODO: we should probably create object typ here instead of the repository to make that more basic
// TODO: it is here much of the logic reside

export default class ProposalMutations {
  async create(
    args: { abstract: any; status: any; users: any },
    context: {
      repository: {
        proposal: { create: (arg0: any, arg1: any, arg2: any) => number };
      };
    }
  ) {
    const id = context.repository.proposal.create(
      args.abstract,
      args.status,
      args.users
    );
    return new Proposal(id, args.abstract, args.status);
  }
}
