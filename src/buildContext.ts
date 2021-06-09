import { container } from 'tsyringe';

import { BasicResolverContext } from './context';
import AdminMutations from './mutations/AdminMutations';
import CallMutations from './mutations/CallMutations';
import FileMutations from './mutations/FileMutations';
import InstrumentMutations from './mutations/InstrumentMutations';
import ProposalMutations from './mutations/ProposalMutations';
import ProposalSettingsMutations from './mutations/ProposalSettingsMutations';
import QuestionaryMutations from './mutations/QuestionaryMutations';
import ReviewMutations from './mutations/ReviewMutations';
import SampleMutations from './mutations/SampleMutations';
import SEPMutations from './mutations/SEPMutations';
import ShipmentMutations from './mutations/ShipmentMutations';
import TemplateMutations from './mutations/TemplateMutations';
import UserMutations from './mutations/UserMutations';
import VisitMutations from './mutations/VisitMutations';
import AdminQueries from './queries/AdminQueries';
import CallQueries from './queries/CallQueries';
import EventLogQueries from './queries/EventLogQueries';
import FileQueries from './queries/FileQueries';
import InstrumentQueries from './queries/InstrumentQueries';
import ProposalQueries from './queries/ProposalQueries';
import ProposalSettingsQueries from './queries/ProposalSettingsQueries';
import QuestionaryQueries from './queries/QuestionaryQueries';
import ReviewQueries from './queries/ReviewQueries';
import SampleQueries from './queries/SampleQueries';
import SEPQueries from './queries/SEPQueries';
import ShipmentQueries from './queries/ShipmentQueries';
import SystemQueries from './queries/SystemQueries';
import TemplateQueries from './queries/TemplateQueries';
import UserQueries from './queries/UserQueries';
import VisitQueries from './queries/VisitQueries';
import { UserAuthorization } from './utils/UserAuthorization';

const context: BasicResolverContext = {
  userAuthorization: container.resolve(UserAuthorization),
  queries: {
    admin: container.resolve(AdminQueries),
    call: container.resolve(CallQueries),
    eventLogs: container.resolve(EventLogQueries),
    file: container.resolve(FileQueries),
    instrument: container.resolve(InstrumentQueries),
    proposal: container.resolve(ProposalQueries),
    proposalSettings: container.resolve(ProposalSettingsQueries),
    questionary: container.resolve(QuestionaryQueries),
    review: container.resolve(ReviewQueries),
    sample: container.resolve(SampleQueries),
    sep: container.resolve(SEPQueries),
    shipment: container.resolve(ShipmentQueries),
    system: container.resolve(SystemQueries),
    template: container.resolve(TemplateQueries),
    user: container.resolve(UserQueries),
    visit: container.resolve(VisitQueries),
  },
  mutations: {
    admin: container.resolve(AdminMutations),
    call: container.resolve(CallMutations),
    file: container.resolve(FileMutations),
    instrument: container.resolve(InstrumentMutations),
    proposal: container.resolve(ProposalMutations),
    proposalSettings: container.resolve(ProposalSettingsMutations),
    questionary: container.resolve(QuestionaryMutations),
    review: container.resolve(ReviewMutations),
    sample: container.resolve(SampleMutations),
    sep: container.resolve(SEPMutations),
    shipment: container.resolve(ShipmentMutations),
    template: container.resolve(TemplateMutations),
    user: container.resolve(UserMutations),
    visit: container.resolve(VisitMutations),
  },
};

export default context;
