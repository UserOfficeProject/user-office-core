export default {
  proposal: function(
    args: { id: string },
    context: { repository: { proposal: { get: (arg0: string) => void } } }
  ) {
    return context.repository.proposal.get(args.id);
  },
  proposals: function(
    args: any,
    context: { repository: { proposal: { getProposals: () => void } } }
  ) {
    return context.repository.proposal.getProposals();
  },
  createProposal: function(
    args: { abstract: string; status: number; users: Array<number> },
    context: {
      mutations: {
        proposal: { create: (arg0: any, arg1: any) => void };
      };
    }
  ) {
    return context.mutations.proposal.create(args, context);
  },
  createUser: function(
    args: { firstname: string; lastname: string },
    context: {
      repository: {
        user: { create: (arg0: any, arg1: any) => void };
      };
    }
  ) {
    return context.repository.user.create(args.firstname, args.lastname);
  },
  user: function(
    args: { id: string },
    context: { repository: { user: { get: (arg0: any) => void } } }
  ) {
    return context.repository.user.get(args.id);
  },
  users: function(
    args: any,
    context: { repository: { user: { getUsers: () => void } } }
  ) {
    return context.repository.user.getUsers();
  }
};
