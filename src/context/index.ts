import { UserWithRole } from '../models/User';
import AdminMutations from '../mutations/AdminMutations';
import CallMutations from '../mutations/CallMutations';
import FileMutations from '../mutations/FileMutations';
import InstrumentMutations from '../mutations/InstrumentMutations';
import ProposalMutations from '../mutations/ProposalMutations';
import QuestionaryMutations from '../mutations/QuestionaryMutations';
import ReviewMutations from '../mutations/ReviewMutations';
import SEPMutations from '../mutations/SEPMutations';
import TemplateMutations from '../mutations/TemplateMutations';
import UserMutations from '../mutations/UserMutations';
import AdminQueries from '../queries/AdminQueries';
import CallQueries from '../queries/CallQueries';
import EventLogQueries from '../queries/EventLogQueries';
import FileQueries from '../queries/FileQueries';
import InstrumentQueries from '../queries/InstrumentQueries';
import ProposalQueries from '../queries/ProposalQueries';
import QuestionaryQueries from '../queries/QuestionaryQueries';
import ReviewQueries from '../queries/ReviewQueries';
import SEPQueries from '../queries/SEPQueries';
import TemplateQueries from '../queries/TemplateQueries';
import UserQueries from '../queries/UserQueries';
import { UserAuthorization } from '../utils/UserAuthorization';
import SampleQueries from '../queries/SampleQueries';

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
  instrument: InstrumentQueries;
  questionary: QuestionaryQueries;
  sample: SampleQueries;
}

interface ResolverContextMutations {
  proposal: ProposalMutations;
  user: UserMutations;
  review: ReviewMutations;
  call: CallMutations;
  file: FileMutations;
  admin: AdminMutations;
  template: TemplateMutations;
  sep: SEPMutations;
  instrument: InstrumentMutations;
  questionary: QuestionaryMutations;
}

export interface BasicResolverContext {
  userAuthorization: UserAuthorization;
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
}

export interface ResolverContext extends BasicResolverContext {
  user: UserWithRole | null;
}
