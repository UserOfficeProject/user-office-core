import { container } from 'tsyringe';

import { BasicResolverContext } from './context';
import BasicUserDetailsLoader from './loaders/BasicUserDetailsLoader';
import UsersLoader from './loaders/UsersLoader';
import PDFServices from './middlewares/factory/factoryServices';
import AdminMutations from './mutations/AdminMutations';
import CallMutations from './mutations/CallMutations';
import EmailTemplateMutations from './mutations/EmailTemplateMutations';
import ExperimentMutations from './mutations/ExperimentMutation';
import FapMutations from './mutations/FapMutations';
import FeedbackMutations from './mutations/FeedbackMutations';
import FileMutations from './mutations/FileMutations';
import GenericTemplateMutations from './mutations/GenericTemplateMutations';
import InstrumentMutations from './mutations/InstrumentMutations';
import InternalReviewMutations from './mutations/InternalReviewMutations';
import InviteMutations from './mutations/InviteMutations';
import PdfTemplateMutations from './mutations/PdfTemplateMutations';
import PredefinedMessageMutations from './mutations/PredefinedMessageMutations';
import ProposalMutations from './mutations/ProposalMutations';
import QuestionaryMutations from './mutations/QuestionaryMutations';
import RedeemCodesMutations from './mutations/RedeemCodesMutations';
import ReviewMutations from './mutations/ReviewMutations';
import SampleMutations from './mutations/SampleMutations';
import ShipmentMutations from './mutations/ShipmentMutations';
import StatusActionsLogsMutations from './mutations/StatusActionsLogsMutations';
import StatusMutations from './mutations/StatusMutations';
import TechniqueMutations from './mutations/TechniqueMutations';
import TemplateMutations from './mutations/TemplateMutations';
import UnitMutations from './mutations/UnitMutations';
import UserMutations from './mutations/UserMutations';
import VisitMutations from './mutations/VisitMutations';
import WorkflowMutations from './mutations/WorkflowMutations';
import AdminQueries from './queries/AdminQueries';
import CallQueries from './queries/CallQueries';
import EmailTemplateQueries from './queries/EmailTemplateQueries';
import EventLogQueries from './queries/EventLogQueries';
import ExperimentQueries from './queries/ExperimentQueries';
import FapQueries from './queries/FapQueries';
import FeedbackQueries from './queries/FeedbackQueries';
import FileQueries from './queries/FileQueries';
import GenericTemplateQueries from './queries/GenericTemplateQueries';
import InstrumentQueries from './queries/InstrumentQueries';
import InternalReviewQueries from './queries/InternalReviewQueries';
import InviteQueries from './queries/InviteQueries';
import PdfTemplateQueries from './queries/PdfTemplateQueries';
import PredefinedMessageQueries from './queries/PredefinedMessageQueries';
import ProposalQueries from './queries/ProposalQueries';
import QuestionaryQueries from './queries/QuestionaryQueries';
import ReviewQueries from './queries/ReviewQueries';
import SampleQueries from './queries/SampleQueries';
import SettingsQueries from './queries/SettingsQueries';
import ShipmentQueries from './queries/ShipmentQueries';
import StatusActionQueries from './queries/StatusActionQueries';
import StatusActionsLogsQueries from './queries/StatusActionsLogsQueries';
import StatusQueries from './queries/StatusQueries';
import SystemQueries from './queries/SystemQueries';
import TechnicalReviewQueries from './queries/TechnicalReviewQueries';
import TechniqueQueries from './queries/TechniqueQueries';
import TemplateQueries from './queries/TemplateQueries';
import UnitQueries from './queries/UnitQueries';
import UserQueries from './queries/UserQueries';
import VisitQueries from './queries/VisitQueries';
import WorkflowQueries from './queries/WorkflowQueries';

const context: BasicResolverContext = {
  queries: {
    admin: container.resolve(AdminQueries),
    call: container.resolve(CallQueries),
    eventLogs: container.resolve(EventLogQueries),
    feedback: container.resolve(FeedbackQueries),
    file: container.resolve(FileQueries),
    genericTemplate: container.resolve(GenericTemplateQueries),
    instrument: container.resolve(InstrumentQueries),
    invite: container.resolve(InviteQueries),
    pdfTemplate: container.resolve(PdfTemplateQueries),
    proposal: container.resolve(ProposalQueries),
    questionary: container.resolve(QuestionaryQueries),
    review: container.resolve(ReviewQueries),
    sample: container.resolve(SampleQueries),
    fap: container.resolve(FapQueries),
    shipment: container.resolve(ShipmentQueries),
    system: container.resolve(SystemQueries),
    technicalReview: container.resolve(TechnicalReviewQueries),
    template: container.resolve(TemplateQueries),
    unit: container.resolve(UnitQueries),
    user: container.resolve(UserQueries),
    visit: container.resolve(VisitQueries),
    predefinedMessage: container.resolve(PredefinedMessageQueries),
    internalReview: container.resolve(InternalReviewQueries),
    technique: container.resolve(TechniqueQueries),
    statusActionsLogs: container.resolve(StatusActionsLogsQueries),
    status: container.resolve(StatusQueries),
    workflow: container.resolve(WorkflowQueries),
    statusAction: container.resolve(StatusActionQueries),
    settings: container.resolve(SettingsQueries),
    experiment: container.resolve(ExperimentQueries),
    emailTemplate: container.resolve(EmailTemplateQueries),
  },
  mutations: {
    admin: container.resolve(AdminMutations),
    call: container.resolve(CallMutations),
    feedback: container.resolve(FeedbackMutations),
    file: container.resolve(FileMutations),
    genericTemplate: container.resolve(GenericTemplateMutations),
    instrument: container.resolve(InstrumentMutations),
    invite: container.resolve(InviteMutations),
    pdfTemplate: container.resolve(PdfTemplateMutations),
    proposal: container.resolve(ProposalMutations),
    questionary: container.resolve(QuestionaryMutations),
    redeemCodes: container.resolve(RedeemCodesMutations),
    review: container.resolve(ReviewMutations),
    sample: container.resolve(SampleMutations),
    fap: container.resolve(FapMutations),
    shipment: container.resolve(ShipmentMutations),
    template: container.resolve(TemplateMutations),
    unit: container.resolve(UnitMutations),
    user: container.resolve(UserMutations),
    visit: container.resolve(VisitMutations),
    predefinedMessage: container.resolve(PredefinedMessageMutations),
    internalReview: container.resolve(InternalReviewMutations),
    technique: container.resolve(TechniqueMutations),
    statusActionsLogs: container.resolve(StatusActionsLogsMutations),
    status: container.resolve(StatusMutations),
    workflow: container.resolve(WorkflowMutations),
    experiment: container.resolve(ExperimentMutations),
    emailTemplate: container.resolve(EmailTemplateMutations),
  },
  clients: {
    scheduler: async () => {
      return undefined;
    },
  },
  services: {
    pdfServices: container.resolve(PDFServices),
  },
  loaders: {
    user: container.resolve(UsersLoader),
    basicUser: container.resolve(BasicUserDetailsLoader),
  },
};

export default context;
