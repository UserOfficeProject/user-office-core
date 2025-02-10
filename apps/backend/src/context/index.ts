import UsersLoader from '../loaders/UsersLoader';
import PDFServices from '../middlewares/factory/factoryServices';
import { Sdk } from '../middlewares/graphqlClient';
import { UserWithRole } from '../models/User';
import AdminMutations from '../mutations/AdminMutations';
import CallMutations from '../mutations/CallMutations';
import FapMutations from '../mutations/FapMutations';
import FeedbackMutations from '../mutations/FeedbackMutations';
import FileMutations from '../mutations/FileMutations';
import GenericTemplateMutations from '../mutations/GenericTemplateMutations';
import InstrumentMutations from '../mutations/InstrumentMutations';
import InternalReviewMutations from '../mutations/InternalReviewMutations';
import InviteMutations from '../mutations/InviteMutations';
import PdfTemplateMutations from '../mutations/PdfTemplateMutations';
import PredefinedMessageMutations from '../mutations/PredefinedMessageMutations';
import ProposalEsiMutations from '../mutations/ProposalEsiMutations';
import ProposalMutations from '../mutations/ProposalMutations';
import ProposalSettingsMutations from '../mutations/ProposalSettingsMutations';
import QuestionaryMutations from '../mutations/QuestionaryMutations';
import RedeemCodesMutations from '../mutations/RedeemCodesMutations';
import ReviewMutations from '../mutations/ReviewMutations';
import SampleEsiMutations from '../mutations/SampleEsiMutations';
import SampleMutations from '../mutations/SampleMutations';
import ShipmentMutations from '../mutations/ShipmentMutations';
import StatusActionsLogsMutations from '../mutations/StatusActionsLogsMutations';
import TechniqueMutations from '../mutations/TechniqueMutations';
import TemplateMutations from '../mutations/TemplateMutations';
import UnitMutations from '../mutations/UnitMutations';
import UserMutations from '../mutations/UserMutations';
import VisitMutations from '../mutations/VisitMutations';
import AdminQueries from '../queries/AdminQueries';
import CallQueries from '../queries/CallQueries';
import EventLogQueries from '../queries/EventLogQueries';
import FapQueries from '../queries/FapQueries';
import FeedbackQueries from '../queries/FeedbackQueries';
import FileQueries from '../queries/FileQueries';
import GenericTemplateQueries from '../queries/GenericTemplateQueries';
import InstrumentQueries from '../queries/InstrumentQueries';
import InternalReviewQueries from '../queries/InternalReviewQueries';
import InviteQueries from '../queries/InviteQueries';
import PdfTemplateQueries from '../queries/PdfTemplateQueries';
import PredefinedMessageQueries from '../queries/PredefinedMessageQueries';
import ProposalEsiQueries from '../queries/ProposalEsiQueries';
import ProposalQueries from '../queries/ProposalQueries';
import ProposalSettingsQueries from '../queries/ProposalSettingsQueries';
import QuestionaryQueries from '../queries/QuestionaryQueries';
import ReviewQueries from '../queries/ReviewQueries';
import SampleEsiQueries from '../queries/SampleEsiQueries';
import SampleQueries from '../queries/SampleQueries';
import ScheduledEventQueries from '../queries/ScheduledEventQueries';
import ShipmentQueries from '../queries/ShipmentQueries';
import StatusActionsLogsQueries from '../queries/StatusActionsLogsQueries';
import SystemQueries from '../queries/SystemQueries';
import TechnicalReviewQueries from '../queries/TechnicalReviewQueries';
import TechniqueQueries from '../queries/TechniqueQueries';
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
  invite: InviteQueries;
  technique: TechniqueQueries;
  pdfTemplate: PdfTemplateQueries;
  proposal: ProposalQueries;
  proposalEsi: ProposalEsiQueries;
  proposalSettings: ProposalSettingsQueries;
  questionary: QuestionaryQueries;
  review: ReviewQueries;
  sample: SampleQueries;
  sampleEsi: SampleEsiQueries;
  scheduledEvent: ScheduledEventQueries;
  fap: FapQueries;
  shipment: ShipmentQueries;
  system: SystemQueries;
  technicalReview: TechnicalReviewQueries;
  template: TemplateQueries;
  unit: UnitQueries;
  user: UserQueries;
  visit: VisitQueries;
  predefinedMessage: PredefinedMessageQueries;
  internalReview: InternalReviewQueries;
  statusActionsLogs: StatusActionsLogsQueries;
}

interface ResolverContextMutations {
  admin: AdminMutations;
  call: CallMutations;
  feedback: FeedbackMutations;
  file: FileMutations;
  genericTemplate: GenericTemplateMutations;
  instrument: InstrumentMutations;
  invite: InviteMutations;
  pdfTemplate: PdfTemplateMutations;
  proposal: ProposalMutations;
  proposalEsi: ProposalEsiMutations;
  proposalSettings: ProposalSettingsMutations;
  questionary: QuestionaryMutations;
  redeemCodes: RedeemCodesMutations;
  review: ReviewMutations;
  sample: SampleMutations;
  sampleEsi: SampleEsiMutations;
  fap: FapMutations;
  shipment: ShipmentMutations;
  template: TemplateMutations;
  unit: UnitMutations;
  user: UserMutations;
  visit: VisitMutations;
  predefinedMessage: PredefinedMessageMutations;
  internalReview: InternalReviewMutations;
  technique: TechniqueMutations;
  statusActionsLogs: StatusActionsLogsMutations;
}
interface ResolverContextServices {
  pdfServices: PDFServices;
}
interface ResolverContextLoader {
  user: UsersLoader;
}

export interface BasicResolverContext {
  mutations: ResolverContextMutations;
  queries: ResolverContextQueries;
  clients: {
    scheduler: () => Promise<Sdk | undefined>;
  };
  services: ResolverContextServices;
  loaders: ResolverContextLoader;
}

export interface ResolverContext extends BasicResolverContext {
  user: UserWithRole | null;
}
