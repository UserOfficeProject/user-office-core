import ProposalMutations from "../mutations/ProposalMutations";
import UserMutations from "../mutations/UserMutations";
import ProposalQueries from "../queries/ProposalQueries";
import UserQueries from "../queries/UserQueries";
import ReviewQueries from "../queries/ReviewQueries";
import { User } from "../models/User";

interface ResolverContextQueries {
  proposal: ProposalQueries;
  user: UserQueries;
  review: ReviewQueries;
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
