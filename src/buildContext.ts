import { BasicResolverContext } from "./context";

// Site specific imports (only ESS atm)
import PostgresUserDataSource from "./datasources/postgres/UserDataSource";
import PostgresProposalDataSource from "./datasources/postgres/ProposalDataSource";
import PostgresReviewDataSource from "./datasources/postgres/ReviewDataSource";
import PostgresCallDataSource from "./datasources/postgres/CallDataSource";
import PostgresFileDataSource from "./datasources/postgres/FileDataSource";
import PostgresAdminDataSource from "./datasources/postgres/AdminDataSource";
import TemplateDataSource from "./datasources/postgres/TemplateDataSource";

import UserQueries from "./queries/UserQueries";
import UserMutations from "./mutations/UserMutations";
import ProposalQueries from "./queries/ProposalQueries";
import ProposalMutations from "./mutations/ProposalMutations";
import CallQueries from "./queries/CallQueries";
import CallMutations from "./mutations/CallMutations";
import { UserAuthorization } from "./utils/UserAuthorization";
import { EventBus } from "./events/eventBus";
import { ApplicationEvent } from "./events/applicationEvents";
import createEventHandlers from "./eventHandlers";
import ReviewQueries from "./queries/ReviewQueries";
import ReviewMutations from "./mutations/ReviewMutations";
import FileQueries from "./queries/FileQueries";
import FileMutations from "./mutations/FileMutations";
import AdminQueries from "./queries/AdminQueries";
import AdminMutations from "./mutations/AdminMutations";
import { Logger } from "./utils/Logger";
import TemplateMutations from "./mutations/TemplateMutations";
import TemplateQueries from "./queries/TemplateQueries";

// Site specific data sources and event handlers (only ESS atm)
const logger = new Logger();
const userDataSource = new PostgresUserDataSource();
const proposalDataSource = new PostgresProposalDataSource(logger);
const reviewDataSource = new PostgresReviewDataSource();
const callDataSource = new PostgresCallDataSource();
const fileDataSource = new PostgresFileDataSource();
const adminDataSource = new PostgresAdminDataSource();
const templateDataSource = new TemplateDataSource(logger);

const userAuthorization = new UserAuthorization(
  userDataSource,
  reviewDataSource
);

const eventHandlers = createEventHandlers(userDataSource);

// From this point nothing is site-specific
const eventBus = new EventBus<ApplicationEvent>(eventHandlers);

const userQueries = new UserQueries(userDataSource, userAuthorization);
const userMutations = new UserMutations(
  userDataSource,
  userAuthorization,
  eventBus
);
const proposalQueries = new ProposalQueries(
  proposalDataSource,
  userAuthorization,
  logger
);
const proposalMutations = new ProposalMutations(
  proposalDataSource,
  templateDataSource,
  userAuthorization,
  eventBus,
  logger
);

const reviewQueries = new ReviewQueries(reviewDataSource, userAuthorization);
const reviewMutations = new ReviewMutations(
  reviewDataSource,
  userAuthorization,
  eventBus
);

const callQueries = new CallQueries(callDataSource, userAuthorization);
const callMutations = new CallMutations(
  callDataSource,
  userAuthorization,
  eventBus
);

const fileQueries = new FileQueries(fileDataSource, userAuthorization);
const fileMutations = new FileMutations(
  fileDataSource,
  userAuthorization,
  eventBus
);

const adminQueries = new AdminQueries(adminDataSource, userAuthorization);
const adminMutations = new AdminMutations(
  adminDataSource,
  userAuthorization,
  eventBus
);

const templateQueries = new TemplateQueries(
  templateDataSource,
  userAuthorization,
  logger
);
const templateMutations = new TemplateMutations(
  templateDataSource,
  userAuthorization,
  eventBus,
  logger
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
    template: templateQueries
  },
  mutations: {
    user: userMutations,
    proposal: proposalMutations,
    review: reviewMutations,
    call: callMutations,
    file: fileMutations,
    admin: adminMutations,
    template: templateMutations
  }
};

export default context;
