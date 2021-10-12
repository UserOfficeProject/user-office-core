import { UserWithRole } from '../models/User';
import AdminMutations from '../mutations/AdminMutations';
import CallMutations from '../mutations/CallMutations';
import FileMutations from '../mutations/FileMutations';
import GenericTemplateMutations from '../mutations/GenericTemplateMutations';
import InstrumentMutations from '../mutations/InstrumentMutations';
import ProposalEsiMutations from '../mutations/ProposalEsiMutations';
import ProposalMutations from '../mutations/ProposalMutations';
import ProposalSettingsMutations from '../mutations/ProposalSettingsMutations';
import QuestionaryMutations from '../mutations/QuestionaryMutations';
import ReviewMutations from '../mutations/ReviewMutations';
import SampleEsiMutations from '../mutations/SampleEsiMutations';
import SampleMutations from '../mutations/SampleMutations';
import SEPMutations from '../mutations/SEPMutations';
import ShipmentMutations from '../mutations/ShipmentMutations';
import TemplateMutations from '../mutations/TemplateMutations';
import UserMutations from '../mutations/UserMutations';
import VisitMutations from '../mutations/VisitMutations';
import AdminQueries from '../queries/AdminQueries';
import CallQueries from '../queries/CallQueries';
import EventLogQueries from '../queries/EventLogQueries';
import FileQueries from '../queries/FileQueries';
import GenericTemplateQueries from '../queries/GenericTemplateQueries';
import InstrumentQueries from '../queries/InstrumentQueries';
import ProposalEsiQueries from '../queries/ProposalEsiQueries';
import ProposalQueries from '../queries/ProposalQueries';
import ProposalSettingsQueries from '../queries/ProposalSettingsQueries';
import QuestionaryQueries from '../queries/QuestionaryQueries';
import ReviewQueries from '../queries/ReviewQueries';
import SampleEsiQueries from '../queries/SampleEsiQueries';
import SampleQueries from '../queries/SampleQueries';
import SEPQueries from '../queries/SEPQueries';
import ShipmentQueries from '../queries/ShipmentQueries';
import SystemQueries from '../queries/SystemQueries';
import TemplateQueries from '../queries/TemplateQueries';
import UserQueries from '../queries/UserQueries';
import VisitQueries from '../queries/VisitQueries';
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
  instrument: InstrumentQueries;
  questionary: QuestionaryQueries;
  sample: SampleQueries;
  genericTemplate: GenericTemplateQueries;
  proposalSettings: ProposalSettingsQueries;
  shipment: ShipmentQueries;
  system: SystemQueries;
  visit: VisitQueries;
  proposalEsi: ProposalEsiQueries;
  sampleEsi: SampleEsiQueries;
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
  sample: SampleMutations;
  genericTemplate: GenericTemplateMutations;
  sampleEsi: SampleEsiMutations;
  proposalSettings: ProposalSettingsMutations;
  shipment: ShipmentMutations;
  visit: VisitMutations;
  proposalEsi: ProposalEsiMutations;
}

export interface BasicResolverContext {
  userAuthorization: UserAuthorization;
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
}

export interface ResolverContext extends BasicResolverContext {
  user: UserWithRole | null;
}
