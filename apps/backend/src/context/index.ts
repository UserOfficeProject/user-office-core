import BasicUserDetailsLoader from '../loaders/BasicUserDetailsLoader';
import UsersLoader from '../loaders/UsersLoader';
import PDFServices from '../middlewares/factory/factoryServices';
import { Sdk } from '../middlewares/graphqlClient';
import { UserWithRole } from '../models/User';
import AdminMutations from '../mutations/AdminMutations';
import CallMutations from '../mutations/CallMutations';
import ExperimentMutations from '../mutations/ExperimentMutation';
import FapMutations from '../mutations/FapMutations';
import FeedbackMutations from '../mutations/FeedbackMutations';
import FileMutations from '../mutations/FileMutations';
import GenericTemplateMutations from '../mutations/GenericTemplateMutations';
import InstrumentMutations from '../mutations/InstrumentMutations';
import InternalReviewMutations from '../mutations/InternalReviewMutations';
import InviteMutations from '../mutations/InviteMutations';
import PdfTemplateMutations from '../mutations/PdfTemplateMutations';
import PredefinedMessageMutations from '../mutations/PredefinedMessageMutations';
import ProposalMutations from '../mutations/ProposalMutations';
import QuestionaryMutations from '../mutations/QuestionaryMutations';
import RedeemCodesMutations from '../mutations/RedeemCodesMutations';
import ReviewMutations from '../mutations/ReviewMutations';
import SampleMutations from '../mutations/SampleMutations';
import ShipmentMutations from '../mutations/ShipmentMutations';
import StatusActionsLogsMutations from '../mutations/StatusActionsLogsMutations';
import StatusMutations from '../mutations/StatusMutations';
import TechniqueMutations from '../mutations/TechniqueMutations';
import TemplateMutations from '../mutations/TemplateMutations';
import UnitMutations from '../mutations/UnitMutations';
import UserMutations from '../mutations/UserMutations';
import VisitMutations from '../mutations/VisitMutations';
import WorkflowMutations from '../mutations/WorkflowMutations';
import AdminQueries from '../queries/AdminQueries';
import CallQueries from '../queries/CallQueries';
import EventLogQueries from '../queries/EventLogQueries';
import ExperimentQueries from '../queries/ExperimentQueries';
import FapQueries from '../queries/FapQueries';
import FeedbackQueries from '../queries/FeedbackQueries';
import FileQueries from '../queries/FileQueries';
import GenericTemplateQueries from '../queries/GenericTemplateQueries';
import InstrumentQueries from '../queries/InstrumentQueries';
import InternalReviewQueries from '../queries/InternalReviewQueries';
import PdfTemplateQueries from '../queries/PdfTemplateQueries';
import PredefinedMessageQueries from '../queries/PredefinedMessageQueries';
import ProposalQueries from '../queries/ProposalQueries';
import QuestionaryQueries from '../queries/QuestionaryQueries';
import ReviewQueries from '../queries/ReviewQueries';
import SampleQueries from '../queries/SampleQueries';
import SettingsQueries from '../queries/SettingsQueries';
import ShipmentQueries from '../queries/ShipmentQueries';
import StatusActionQueries from '../queries/StatusActionQueries';
import StatusActionsLogsQueries from '../queries/StatusActionsLogsQueries';
import StatusQueries from '../queries/StatusQueries';
import SystemQueries from '../queries/SystemQueries';
import TechnicalReviewQueries from '../queries/TechnicalReviewQueries';
import TechniqueQueries from '../queries/TechniqueQueries';
import TemplateQueries from '../queries/TemplateQueries';
import UnitQueries from '../queries/UnitQueries';
import UserQueries from '../queries/UserQueries';
import VisitQueries from '../queries/VisitQueries';
import WorkflowQueries from '../queries/WorkflowQueries';

interface ResolverContextQueries {
  admin: AdminQueries;
  call: CallQueries;
  eventLogs: EventLogQueries;
  feedback: FeedbackQueries;
  file: FileQueries;
  genericTemplate: GenericTemplateQueries;
  instrument: InstrumentQueries;
  technique: TechniqueQueries;
  pdfTemplate: PdfTemplateQueries;
  proposal: ProposalQueries;
  questionary: QuestionaryQueries;
  review: ReviewQueries;
  sample: SampleQueries;
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
  status: StatusQueries;
  settings: SettingsQueries;
  workflow: WorkflowQueries;
  statusAction: StatusActionQueries;
  experiment: ExperimentQueries;
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
  questionary: QuestionaryMutations;
  redeemCodes: RedeemCodesMutations;
  review: ReviewMutations;
  sample: SampleMutations;
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
  status: StatusMutations;
  workflow: WorkflowMutations;
  experiment: ExperimentMutations;
}
interface ResolverContextServices {
  pdfServices: PDFServices;
}
interface ResolverContextLoader {
  user: UsersLoader;
  basicUser: BasicUserDetailsLoader;
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
