import { container } from 'tsyringe';

import { CallAuthorization } from './auth/CallAuthorization';
import { ProposalAuthorization } from './auth/ProposalAuthorization';
import { BasicResolverContext } from './context';
import BasicUserDetailsLoader from './loaders/BasicUserDetailsLoader';
import UsersLoader from './loaders/UsersLoader';
import PDFServices from './middlewares/factory/factoryServices';
import AdminMutations from './mutations/AdminMutations';
import CallMutations from './mutations/CallMutations';
import DataAccessUsersMutations from './mutations/DataAccessUsersMutations';
import ExperimentMutations from './mutations/ExperimentMutation';
import ExperimentSafetyPdfTemplateMutations from './mutations/ExperimentSafetyPdfTemplateMutations';
import FapMutations from './mutations/FapMutations';
import FeedbackMutations from './mutations/FeedbackMutations';
import FileMutations from './mutations/FileMutations';
import GenericTemplateMutations from './mutations/GenericTemplateMutations';
import InstrumentMutations from './mutations/InstrumentMutations';
import InternalReviewMutations from './mutations/InternalReviewMutations';
import InviteMutations from './mutations/InviteMutations';
import PredefinedMessageMutations from './mutations/PredefinedMessageMutations';
import ProposalMutations from './mutations/ProposalMutations';
import ProposalPdfTemplateMutations from './mutations/ProposalPdfTemplateMutations';
import QuestionaryMutations from './mutations/QuestionaryMutations';
import RedeemCodesMutations from './mutations/RedeemCodesMutations';
import ReviewMutations from './mutations/ReviewMutations';
import SampleMutations from './mutations/SampleMutations';
import ShipmentMutations from './mutations/ShipmentMutations';
import StatusActionsLogsMutations from './mutations/StatusActionsLogsMutations';
import StatusMutations from './mutations/StatusMutations';
import TagMutations from './mutations/TagMutations';
import TechniqueMutations from './mutations/TechniqueMutations';
import TemplateMutations from './mutations/TemplateMutations';
import UnitMutations from './mutations/UnitMutations';
import UserMutations from './mutations/UserMutations';
import VisitMutations from './mutations/VisitMutations';
import WorkflowMutations from './mutations/WorkflowMutations';
import AdminQueries from './queries/AdminQueries';
import CallQueries from './queries/CallQueries';
import DataAccessUsersQueries from './queries/DataAccessUsersQueries';
import EventLogQueries from './queries/EventLogQueries';
import ExperimentQueries from './queries/ExperimentQueries';
import ExperimentSafetyPdfTemplateQueries from './queries/ExperimentSafetyPdfTemplateQueries';
import FapQueries from './queries/FapQueries';
import FeedbackQueries from './queries/FeedbackQueries';
import FileQueries from './queries/FileQueries';
import GenericTemplateQueries from './queries/GenericTemplateQueries';
import InstrumentQueries from './queries/InstrumentQueries';
import InternalReviewQueries from './queries/InternalReviewQueries';
import InviteQueries from './queries/InviteQueries';
import PredefinedMessageQueries from './queries/PredefinedMessageQueries';
import ProposalPdfTemplateQueries from './queries/ProposalPdfTemplateQueries';
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
import TagQueries from './queries/TagQueries';
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
    dataAccessUsers: container.resolve(DataAccessUsersQueries),
    eventLogs: container.resolve(EventLogQueries),
    feedback: container.resolve(FeedbackQueries),
    file: container.resolve(FileQueries),
    genericTemplate: container.resolve(GenericTemplateQueries),
    instrument: container.resolve(InstrumentQueries),
    invite: container.resolve(InviteQueries),
    proposalPdfTemplate: container.resolve(ProposalPdfTemplateQueries),
    experimentSafetyPdfTemplate: container.resolve(
      ExperimentSafetyPdfTemplateQueries
    ),
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
    tag: container.resolve(TagQueries),
    experiment: container.resolve(ExperimentQueries),
  },
  mutations: {
    admin: container.resolve(AdminMutations),
    call: container.resolve(CallMutations),
    dataAccessUsers: container.resolve(DataAccessUsersMutations),
    feedback: container.resolve(FeedbackMutations),
    file: container.resolve(FileMutations),
    genericTemplate: container.resolve(GenericTemplateMutations),
    instrument: container.resolve(InstrumentMutations),
    invite: container.resolve(InviteMutations),
    proposalPdfTemplate: container.resolve(ProposalPdfTemplateMutations),
    experimentSafetyPdfTemplate: container.resolve(
      ExperimentSafetyPdfTemplateMutations
    ),
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
    tag: container.resolve(TagMutations),
    experiment: container.resolve(ExperimentMutations),
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
  auth: {
    callAuthorization: container.resolve(CallAuthorization),
    proposalAuthorization: container.resolve(ProposalAuthorization),
  },
};

export default context;
