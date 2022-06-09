import { container } from 'tsyringe';

import { BasicResolverContext } from './context';
import AdminMutations from './mutations/AdminMutations';
import CallMutations from './mutations/CallMutations';
import FeedbackMutations from './mutations/FeedbackMutations';
import FileMutations from './mutations/FileMutations';
import GenericTemplateMutations from './mutations/GenericTemplateMutations';
import InstrumentMutations from './mutations/InstrumentMutations';
import ProposalEsiMutations from './mutations/ProposalEsiMutations';
import ProposalMutations from './mutations/ProposalMutations';
import ProposalSettingsMutations from './mutations/ProposalSettingsMutations';
import QuestionaryMutations from './mutations/QuestionaryMutations';
import ReviewMutations from './mutations/ReviewMutations';
import SampleEsiMutations from './mutations/SampleEsiMutations';
import SampleMutations from './mutations/SampleMutations';
import SEPMutations from './mutations/SEPMutations';
import ShipmentMutations from './mutations/ShipmentMutations';
import TemplateMutations from './mutations/TemplateMutations';
import UnitMutations from './mutations/UnitMutations';
import UserMutations from './mutations/UserMutations';
import VisitMutations from './mutations/VisitMutations';
import AdminQueries from './queries/AdminQueries';
import CallQueries from './queries/CallQueries';
import EventLogQueries from './queries/EventLogQueries';
import FeedbackQueries from './queries/FeedbackQueries';
import FileQueries from './queries/FileQueries';
import GenericTemplateQueries from './queries/GenericTemplateQueries';
import InstrumentQueries from './queries/InstrumentQueries';
import ProposalEsiQueries from './queries/ProposalEsiQueries';
import ProposalQueries from './queries/ProposalQueries';
import ProposalSettingsQueries from './queries/ProposalSettingsQueries';
import QuestionaryQueries from './queries/QuestionaryQueries';
import ReviewQueries from './queries/ReviewQueries';
import SampleEsiQueries from './queries/SampleEsiQueries';
import SampleQueries from './queries/SampleQueries';
import ScheduledEventQueries from './queries/ScheduledEventQueries';
import SEPQueries from './queries/SEPQueries';
import ShipmentQueries from './queries/ShipmentQueries';
import SystemQueries from './queries/SystemQueries';
import TemplateQueries from './queries/TemplateQueries';
import UnitQueries from './queries/UnitQueries';
import UserQueries from './queries/UserQueries';
import VisitQueries from './queries/VisitQueries';

const context: BasicResolverContext = {
  queries: {
    admin: container.resolve(AdminQueries),
    call: container.resolve(CallQueries),
    eventLogs: container.resolve(EventLogQueries),
    feedback: container.resolve(FeedbackQueries),
    file: container.resolve(FileQueries),
    genericTemplate: container.resolve(GenericTemplateQueries),
    instrument: container.resolve(InstrumentQueries),
    proposal: container.resolve(ProposalQueries),
    proposalEsi: container.resolve(ProposalEsiQueries),
    proposalSettings: container.resolve(ProposalSettingsQueries),
    questionary: container.resolve(QuestionaryQueries),
    review: container.resolve(ReviewQueries),
    sample: container.resolve(SampleQueries),
    sampleEsi: container.resolve(SampleEsiQueries),
    scheduledEvent: container.resolve(ScheduledEventQueries),
    sep: container.resolve(SEPQueries),
    shipment: container.resolve(ShipmentQueries),
    system: container.resolve(SystemQueries),
    template: container.resolve(TemplateQueries),
    unit: container.resolve(UnitQueries),
    user: container.resolve(UserQueries),
    visit: container.resolve(VisitQueries),
  },
  mutations: {
    admin: container.resolve(AdminMutations),
    call: container.resolve(CallMutations),
    feedback: container.resolve(FeedbackMutations),
    file: container.resolve(FileMutations),
    genericTemplate: container.resolve(GenericTemplateMutations),
    instrument: container.resolve(InstrumentMutations),
    proposal: container.resolve(ProposalMutations),
    proposalEsi: container.resolve(ProposalEsiMutations),
    proposalSettings: container.resolve(ProposalSettingsMutations),
    questionary: container.resolve(QuestionaryMutations),
    review: container.resolve(ReviewMutations),
    sample: container.resolve(SampleMutations),
    sampleEsi: container.resolve(SampleEsiMutations),
    sep: container.resolve(SEPMutations),
    shipment: container.resolve(ShipmentMutations),
    template: container.resolve(TemplateMutations),
    unit: container.resolve(UnitMutations),
    user: container.resolve(UserMutations),
    visit: container.resolve(VisitMutations),
  },
};

export default context;
