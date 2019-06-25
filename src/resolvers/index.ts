import { ResolverContext } from "../context";
import { isRejection, Rejection } from "../rejection";
import Proposal from "../models/Proposal";
import User from "../models/User";

interface ProposalArgs {
  id: number;
}

interface ProposalsArgs {}

interface CreateProposalArgs {}

interface UpdateProposalArgs {
  id: string;
  title: string;
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

interface AddUserRoleArgs {
  userID: number;
  roleID: number;
}

interface UsersArgs {}

interface RolesArgs {}

interface CreateUserArgs {
  firstname: string;
  lastname: string;
}

function createMutationWrapper<T>(key: string) {
  return async function(promise: Promise<T | Rejection>) {
    const result = await promise;
    if (isRejection(result)) {
      return {
        [key]: null,
        error: result.reason
      };
    } else {
      return {
        [key]: result,
        error: null
      };
    }
  };
}

const wrapProposalMutation = createMutationWrapper<Proposal>("proposal");
const wrapUserMutation = createMutationWrapper<User>("user");

export default {
  proposal(args: ProposalArgs, context: ResolverContext) {
    return context.queries.proposal.get(args.id);
  },

  proposals(_args: ProposalsArgs, context: ResolverContext) {
    return context.queries.proposal.getAll();
  },

  createProposal(args: CreateProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.create(context.user)
    );
  },

  updateProposal(args: UpdateProposalArgs, context: ResolverContext) {
    const { id, title, abstract, status, users } = args;
    return wrapProposalMutation(
      context.mutations.proposal.update(
        context.user,
        id,
        title,
        abstract,
        status,
        users
      )
    );
  },

  approveProposal(args: ApproveProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.accept(context.user, args.id)
    );
  },

  rejectProposal(args: ApproveProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.reject(context.user, args.id)
    );
  },

  submitProposal(args: ApproveProposalArgs, context: ResolverContext) {
    return wrapProposalMutation(
      context.mutations.proposal.submit(context.user, args.id)
    );
  },

  user(args: UserArgs, context: ResolverContext) {
    return context.queries.user.get(args.id, context.user);
  },

  users(_args: UsersArgs, context: ResolverContext) {
    return context.queries.user.getAll(context.user);
  },

  roles(_args: RolesArgs, context: ResolverContext) {
    return context.queries.user.getRoles();
  },

  createUser(args: CreateUserArgs, context: ResolverContext) {
    return wrapUserMutation(
      context.mutations.user.create(args.firstname, args.lastname)
    );
  },

  addUserRole(args: AddUserRoleArgs, context: ResolverContext) {
    return context.mutations.user.addRole(
      context.user,
      args.userID,
      args.roleID
    );
  }
};
