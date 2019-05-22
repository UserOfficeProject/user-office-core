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
  proposal(args: ProposalArgs, context: ResolverContext) {
    return context.queries.proposal.get(args.id);
  },

  proposals(_args: ProposalsArgs, context: ResolverContext) {
    return context.queries.proposal.getAll();
  },

  createProposal(args: CreateProposalArgs, context: ResolverContext) {
    const { abstract, status, users } = args;
    return context.mutations.proposal.create(
      context.user,
      abstract,
      status,
      users
    );
  },

  approveProposal(args: ApproveProposalArgs, context: ResolverContext) {
    return context.mutations.proposal.accept(context.user, args.id);
  },

  user(args: UserArgs, context: ResolverContext) {
    return context.queries.user.get(args.id, context.user);
  },

  users(_args: UsersArgs, context: ResolverContext) {
    return context.queries.user.getAll(context.user);
  },

  createUser(args: CreateUserArgs, context: ResolverContext) {
    return context.mutations.user.create(args.firstname, args.lastname);
  }
};
