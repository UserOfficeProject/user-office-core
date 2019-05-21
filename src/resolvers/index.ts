import { ResolverContext } from "../context";

interface ProposalArgs {
  id: number;
}

interface ProposalsArgs {}

interface CreateProposalArgs {
  abstract: string;
  status: number;
  users: number[];
}

interface ApproveProposalArgs {
  id: number;
}

interface UserArgs {
  id: number;
}

interface UsersArgs {}

interface CreateUserArgs {
  firstname: string;
  lastname: string;
}

export default {
  proposal: function(args: ProposalArgs, context: ResolverContext) {
    return context.queries.proposal.get(args.id);
  },

  proposals: function(_args: ProposalsArgs, context: ResolverContext) {
    return context.queries.proposal.getAll();
  },

  createProposal: function(args: CreateProposalArgs, context: ResolverContext) {
    const { abstract, status, users } = args;
    return context.mutations.proposal.create(
      context.user,
      abstract,
      status,
      users
    );
  },

  approveProposal: function(
    args: ApproveProposalArgs,
    context: ResolverContext
  ) {
    return context.mutations.proposal.accept(context.user, args.id);
  },

  user: function(args: UserArgs, context: ResolverContext) {
    return context.queries.user.get(args.id);
  },

  users: function(_args: UsersArgs, context: ResolverContext) {
    return context.queries.user.getAll();
  },

  createUser: function(args: CreateUserArgs, context: ResolverContext) {
    return context.mutations.user.create(args.firstname, args.lastname);
  }
};
