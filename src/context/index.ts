import ProposalMutations from "../mutations/ProposalMutations";
import UserMutations from "../mutations/UserMutations";
import CallMutations from "../mutations/CallMutations";
import ProposalQueries from "../queries/ProposalQueries";
import UserQueries from "../queries/UserQueries";
import CallQueries from "../queries/CallQueries";
import ReviewQueries from "../queries/ReviewQueries";
import ReviewMutations from "../mutations/ReviewMutations";
import { User } from "../models/User";

interface ResolverContextQueries {
  proposal: ProposalQueries;
  user: UserQueries;
  review: ReviewQueries;
  call: CallQueries;
}

interface ResolverContextMutations {
  proposal: ProposalMutations;
  user: UserMutations;
  review: ReviewMutations;
  call: CallMutations;
}

export interface BasicResolverContext {
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
}

export interface ResolverContext extends BasicResolverContext {
  user: User | null;
}
