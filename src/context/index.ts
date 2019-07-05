import ProposalMutations from "../mutations/ProposalMutations";
import UserMutations from "../mutations/UserMutations";
import ProposalQueries from "../Queries/ProposalQueries";
import UserQueries from "../queries/UserQueries";
import { User } from "../models/User";

interface ResolverContextQueries {
  proposal: ProposalQueries;
  user: UserQueries;
}

interface ResolverContextMutations {
  proposal: ProposalMutations;
  user: UserMutations;
}

export interface BasicResolverContext {
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
}

export interface ResolverContext extends BasicResolverContext {
  user: User | null;
}
