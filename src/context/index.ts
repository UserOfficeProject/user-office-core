import ProposalMutations from "../mutations/ProposalMutations";
import UserMutations from "../mutations/UserMutations";
import ProposalQueries from "../Queries/ProposalQueries";
import UserQueries from "../queries/UserQueries";

interface ResolverContextQueries {
  proposal: ProposalQueries;
  user: UserQueries;
}

interface ResolverContextMutations {
  proposal: ProposalMutations;
  user: UserMutations;
}

export interface ResolverContext {
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
}
