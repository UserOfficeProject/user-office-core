import ProposalMutations from "../mutations/ProposalMutations";
import UserMutations from "../mutations/UserMutations";
import CallMutations from "../mutations/CallMutations";
import ProposalQueries from "../queries/ProposalQueries";
import UserQueries from "../queries/UserQueries";
import CallQueries from "../queries/CallQueries";
import ReviewQueries from "../queries/ReviewQueries";
import ReviewMutations from "../mutations/ReviewMutations";
import { User } from "../models/User";
import FileMutations from "../mutations/FileMutations";
import FileQueries from "../queries/FileQueries";
import AdminMutations from "../mutations/AdminMutations";
import AdminQueries from "../queries/AdminQueries";
import { UserAuthorization } from "../utils/UserAuthorization";
import TemplateMutations from "../mutations/TemplateMutations";
import TemplateQueries from "../queries/TemplateQueries";

interface ResolverContextQueries {
  proposal: ProposalQueries;
  user: UserQueries;
  review: ReviewQueries;
  call: CallQueries;
  file: FileQueries;
  admin: AdminQueries;
  template: TemplateQueries;
}

interface ResolverContextMutations {
  proposal: ProposalMutations;
  user: UserMutations;
  review: ReviewMutations;
  call: CallMutations;
  file: FileMutations;
  admin: AdminMutations;
  template: TemplateMutations;
}

export interface BasicResolverContext {
  userAuthorization: UserAuthorization;
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
}

export interface ResolverContext extends BasicResolverContext {
  user: User | null;
}
