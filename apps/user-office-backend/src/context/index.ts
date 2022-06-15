import { UserWithRole } from '../models/User';
import AdminMutations from '../mutations/AdminMutations';
import CallMutations from '../mutations/CallMutations';
import FeedbackMutations from '../mutations/FeedbackMutations';
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
import UnitMutations from '../mutations/UnitMutations';
import UserMutations from '../mutations/UserMutations';
import VisitMutations from '../mutations/VisitMutations';
import AdminQueries from '../queries/AdminQueries';
import CallQueries from '../queries/CallQueries';
import EventLogQueries from '../queries/EventLogQueries';
import FeedbackQueries from '../queries/FeedbackQueries';
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
import ScheduledEventQueries from '../queries/ScheduledEventQueries';
import SEPQueries from '../queries/SEPQueries';
import ShipmentQueries from '../queries/ShipmentQueries';
import SystemQueries from '../queries/SystemQueries';
import TemplateQueries from '../queries/TemplateQueries';
import UnitQueries from '../queries/UnitQueries';
import UserQueries from '../queries/UserQueries';
import VisitQueries from '../queries/VisitQueries';

interface ResolverContextQueries {
  admin: AdminQueries;
  call: CallQueries;
  eventLogs: EventLogQueries;
  feedback: FeedbackQueries;
  file: FileQueries;
  genericTemplate: GenericTemplateQueries;
  instrument: InstrumentQueries;
  proposal: ProposalQueries;
  proposalEsi: ProposalEsiQueries;
  proposalSettings: ProposalSettingsQueries;
  questionary: QuestionaryQueries;
  review: ReviewQueries;
  sample: SampleQueries;
  sampleEsi: SampleEsiQueries;
  scheduledEvent: ScheduledEventQueries;
  sep: SEPQueries;
  shipment: ShipmentQueries;
  system: SystemQueries;
  template: TemplateQueries;
  unit: UnitQueries;
  user: UserQueries;
  visit: VisitQueries;
}

interface ResolverContextMutations {
  admin: AdminMutations;
  call: CallMutations;
  feedback: FeedbackMutations;
  file: FileMutations;
  genericTemplate: GenericTemplateMutations;
  instrument: InstrumentMutations;
  proposal: ProposalMutations;
  proposalEsi: ProposalEsiMutations;
  proposalSettings: ProposalSettingsMutations;
  questionary: QuestionaryMutations;
  review: ReviewMutations;
  sample: SampleMutations;
  sampleEsi: SampleEsiMutations;
  sep: SEPMutations;
  shipment: ShipmentMutations;
  template: TemplateMutations;
  unit: UnitMutations;
  user: UserMutations;
  visit: VisitMutations;
}

export interface BasicResolverContext {
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
}

export interface ResolverContext extends BasicResolverContext {
  user: UserWithRole | null;
}
