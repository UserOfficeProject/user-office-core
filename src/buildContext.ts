import { BasicResolverContext } from './context';
// Site specific imports (only ESS atm)
import PostgresAdminDataSource from './datasources/postgres/AdminDataSource';
import PostgresCallDataSource from './datasources/postgres/CallDataSource';
import PostgresEventLogsDataSource from './datasources/postgres/EventLogsDataSource';
import PostgresFileDataSource from './datasources/postgres/FileDataSource';
import PostgresProposalDataSource from './datasources/postgres/ProposalDataSource';
import PostgresReviewDataSource from './datasources/postgres/ReviewDataSource';
import PostgresSEPDataSource from './datasources/postgres/SEPDataSource';
import TemplateDataSource from './datasources/postgres/TemplateDataSource';
import PostgresUserDataSource from './datasources/postgres/UserDataSource';
import createEventHandlers from './eventHandlers';
import { ApplicationEvent } from './events/applicationEvents';
import { EventBus } from './events/eventBus';
import AdminMutations from './mutations/AdminMutations';
import CallMutations from './mutations/CallMutations';
import FileMutations from './mutations/FileMutations';
import ProposalMutations from './mutations/ProposalMutations';
import ReviewMutations from './mutations/ReviewMutations';
import SEPMutations from './mutations/SEPMutations';
import TemplateMutations from './mutations/TemplateMutations';
import UserMutations from './mutations/UserMutations';
import AdminQueries from './queries/AdminQueries';
import CallQueries from './queries/CallQueries';
import EventLogQueries from './queries/EventLogQueries';
import FileQueries from './queries/FileQueries';
import ProposalQueries from './queries/ProposalQueries';
import ReviewQueries from './queries/ReviewQueries';
import SEPQueries from './queries/SEPQueries';
import TemplateQueries from './queries/TemplateQueries';
import UserQueries from './queries/UserQueries';
import { logger } from './utils/Logger';
import { UserAuthorization } from './utils/UserAuthorization';

// Site specific data sources and event handlers (only ESS atm)
const userDataSource = new PostgresUserDataSource();
const proposalDataSource = new PostgresProposalDataSource();
const reviewDataSource = new PostgresReviewDataSource();
const callDataSource = new PostgresCallDataSource();
const fileDataSource = new PostgresFileDataSource();
const adminDataSource = new PostgresAdminDataSource();
const templateDataSource = new TemplateDataSource();
const eventLogsDataSource = new PostgresEventLogsDataSource();
const sepDataSource = new PostgresSEPDataSource();

const userAuthorization = new UserAuthorization(
  userDataSource,
  reviewDataSource
);

const eventHandlers = createEventHandlers(userDataSource, eventLogsDataSource);

// From this point nothing is site-specific
export const eventBus = new EventBus<ApplicationEvent>(eventHandlers);

const userQueries = new UserQueries(userDataSource, userAuthorization);
const userMutations = new UserMutations(userDataSource, userAuthorization);

const proposalQueries = new ProposalQueries(
  proposalDataSource,
  userAuthorization,
  logger
);
const proposalMutations = new ProposalMutations(
  proposalDataSource,
  templateDataSource,
  userAuthorization,
  logger
);

const reviewQueries = new ReviewQueries(reviewDataSource, userAuthorization);
const reviewMutations = new ReviewMutations(
  reviewDataSource,
  userAuthorization
);

const callQueries = new CallQueries(callDataSource, userAuthorization);
const callMutations = new CallMutations(callDataSource, userAuthorization);

const fileQueries = new FileQueries(fileDataSource, userAuthorization);
const fileMutations = new FileMutations(fileDataSource, userAuthorization);

const adminQueries = new AdminQueries(adminDataSource, userAuthorization);
const adminMutations = new AdminMutations(adminDataSource, userAuthorization);

const templateQueries = new TemplateQueries(
  templateDataSource,
  userAuthorization,
  logger
);
const templateMutations = new TemplateMutations(
  templateDataSource,
  userAuthorization,
  logger
);

const eventLogQueries = new EventLogQueries(
  eventLogsDataSource,
  userAuthorization
);

const sepQueries = new SEPQueries(sepDataSource, userAuthorization);
const sepMutations = new SEPMutations(sepDataSource, userAuthorization);

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
  },
};

export default context;
