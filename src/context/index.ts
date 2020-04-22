import { User } from '../models/User';
import AdminMutations from '../mutations/AdminMutations';
import CallMutations from '../mutations/CallMutations';
import FileMutations from '../mutations/FileMutations';
import ProposalMutations from '../mutations/ProposalMutations';
import ReviewMutations from '../mutations/ReviewMutations';
import SEPMutations from '../mutations/SEPMutations';
import ProposalAdminMutations from '../mutations/ProposalAdminMutations';
import UserMutations from '../mutations/UserMutations';
import AdminQueries from '../queries/AdminQueries';
import CallQueries from '../queries/CallQueries';
import EventLogQueries from '../queries/EventLogQueries';
import FileQueries from '../queries/FileQueries';
import ProposalQueries from '../queries/ProposalQueries';
import ReviewQueries from '../queries/ReviewQueries';
import SEPQueries from '../queries/SEPQueries';
import TemplateQueries from '../queries/TemplateQueries';
import UserQueries from '../queries/UserQueries';
import { UserAuthorization } from '../utils/UserAuthorization';

interface ResolverContextQueries {
  proposal: ProposalQueries;
  user: UserQueries;
  review: ReviewQueries;
  call: CallQueries;
  file: FileQueries;
  admin: AdminQueries;
  template: TemplateQueries;
  eventLogs: EventLogQueries;
  sep: SEPQueries;
}

interface ResolverContextMutations {
  proposal: ProposalMutations;
  user: UserMutations;
  review: ReviewMutations;
  call: CallMutations;
  file: FileMutations;
  admin: AdminMutations;
  proposalAdmin: ProposalAdminMutations;
  sep: SEPMutations;
}

export interface BasicResolverContext {
  userAuthorization: UserAuthorization;
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
}

export interface ResolverContext extends BasicResolverContext {
  user: User | null;
}
