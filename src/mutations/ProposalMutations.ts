import Proposal from "../models/Proposal";

// TODO: we should probably create object typ here instead of the repository to make that more basic
// TODO: it is here much of the logic reside

export default class ProposalMutations {
  create(
    args: { abstract: string; status: number; users: Array<number> },
    context: {
      repository: {
        proposal: {
          create: (
            abstract: string,
            status: number,
            users: Array<number>
          ) => any;
        };
      };
      messageBroker: any;
    }
  ) {
    context.messageBroker.sendMessage("Proposal Created");
    return context.repository.proposal
      .create(args.abstract, args.status, args.users)
      .then((id: number) =>
        id ? new Proposal(id, args.abstract, args.status) : null
      );
  }
}
