import { logger } from '@esss-swap/duo-logger';

import { BasicResolverContext } from './context';
// Site specific imports (only ESS atm)
import {
  adminDataSource,
  callDataSource,
  eventLogsDataSource,
  fileDataSource,
  instrumentDatasource,
  proposalDataSource,
  proposalSettingsDataSource,
  questionaryDataSource,
  reviewDataSource,
  sampleDataSource,
  sepDataSource,
  shipmentDataSource,
  systemDataSource,
  templateDataSource,
  userDataSource,
} from './datasources';
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
import { questionaryAuthorization } from './utils/QuestionaryAuthorization';
import { SampleAuthorization } from './utils/SampleAuthorization';
import { ShipmentAuthorization } from './utils/ShipmentAuthorization';
import { userAuthorization } from './utils/UserAuthorization';

// From this point nothing is site-specific

const sampleAuthorization = new SampleAuthorization(
  sampleDataSource,
  proposalDataSource
);

const shipmentAuthorization = new ShipmentAuthorization(
  shipmentDataSource,
  proposalDataSource
);

const userQueries = new UserQueries(userDataSource);
const userMutations = new UserMutations(userDataSource, userAuthorization);

const proposalQueries = new ProposalQueries(
  proposalDataSource,
  callDataSource,
  userAuthorization
);
const proposalMutations = new ProposalMutations(
  proposalDataSource,
  questionaryDataSource,
  callDataSource,
  userAuthorization,
  logger
);

const reviewQueries = new ReviewQueries(reviewDataSource, userAuthorization);
const reviewMutations = new ReviewMutations(
  reviewDataSource,
  userAuthorization
);

const callQueries = new CallQueries(callDataSource);
const callMutations = new CallMutations(callDataSource);

const fileQueries = new FileQueries(fileDataSource);
const fileMutations = new FileMutations(fileDataSource);

const adminQueries = new AdminQueries(adminDataSource);
const adminMutations = new AdminMutations(adminDataSource);

const templateQueries = new TemplateQueries(templateDataSource);
const templateMutations = new TemplateMutations(templateDataSource);

const eventLogQueries = new EventLogQueries(eventLogsDataSource);

const sepQueries = new SEPQueries(sepDataSource);
const sepMutations = new SEPMutations(sepDataSource, userAuthorization);

const systemQueries = new SystemQueries(systemDataSource);

const instrumentQueries = new InstrumentQueries(
  instrumentDatasource,
  sepDataSource
);
const instrumentMutations = new InstrumentMutations(
  instrumentDatasource,
  userAuthorization
);

const questionaryQueries = new QuestionaryQueries(
  questionaryDataSource,
  questionaryAuthorization
);
const questionaryMutations = new QuestionaryMutations(
  questionaryDataSource,
  templateDataSource,
  questionaryAuthorization,
  logger
);

const sampleQueries = new SampleQueries(
  sampleDataSource,
  sampleAuthorization,
  shipmentAuthorization
);

const sampleMutations = new SampleMutations(
  sampleDataSource,
  questionaryDataSource,
  templateDataSource,
  proposalDataSource,
  sampleAuthorization
);

const proposalSettingsQueries = new ProposalSettingsQueries(
  proposalSettingsDataSource
);

const proposalSettingsMutations = new ProposalSettingsMutations(
  proposalSettingsDataSource
);

const shipmentQueries = new ShipmentQueries(
  shipmentDataSource,
  shipmentAuthorization
);

const shipmentMutations = new ShipmentMutations(
  shipmentDataSource,
  questionaryDataSource,
  templateDataSource,
  proposalDataSource,
  sampleAuthorization,
  shipmentAuthorization
);

const context: BasicResolverContext = {
  userAuthorization,
  queries: {
    user: userQueries,
    proposal: proposalQueries,
    review: reviewQueries,
    call: callQueries,
    file: fileQueries,
    admin: adminQueries,
    template: templateQueries,
    eventLogs: eventLogQueries,
    sep: sepQueries,
    instrument: instrumentQueries,
    questionary: questionaryQueries,
    sample: sampleQueries,
    proposalSettings: proposalSettingsQueries,
    shipment: shipmentQueries,
    system: systemQueries,
  },
  mutations: {
    user: userMutations,
    proposal: proposalMutations,
    review: reviewMutations,
    call: callMutations,
    file: fileMutations,
    admin: adminMutations,
    sep: sepMutations,
    template: templateMutations,
    instrument: instrumentMutations,
    questionary: questionaryMutations,
    sample: sampleMutations,
    proposalSettings: proposalSettingsMutations,
    shipment: shipmentMutations,
  },
};

export default context;
