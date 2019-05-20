export default {
  proposal: function(args: any, context: any) {
    return context.query.proposal.get(args.id, context.repository.proposal);
  },
  proposals: function(
    args: any,
    context: { repository: { proposal: { getProposals: () => void } } }
  ) {
    return context.repository.proposal.getProposals();
  },
  createProposal: function(
    args: { abstract: string; status: number; users: number[] },
    context: any
  ) {
    return context.mutations.proposal.create(
      args,
      context.repository.proposal,
      context.messageBroker
    );
  },
  approveProposal: function(args: { id: number }, context: any) {
    return context.mutations.proposal.accept(
      args.id,
      context.repository.proposal,
      ["User_Officer"]
    );
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
