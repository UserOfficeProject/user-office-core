import { BasicResolverContext } from "./context";

// Site specific imports (only ESS atm)
import PostgresUserDataSource from "./datasources/postgres/UserDataSource";
import PostgresProposalDataSource from "./datasources/postgres/ProposalDataSource";
import PostgresReviewDataSource from "./datasources/postgres/ReviewDataSource";
import PostgresCallDataSource from "./datasources/postgres/CallDataSource";
import PostgresFileDataSource from "./datasources/postgres/FileDataSource";

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

// Site specific data sources and event handlers (only ESS atm)
const userDataSource = new PostgresUserDataSource();
const proposalDataSource = new PostgresProposalDataSource();
const reviewDataSource = new PostgresReviewDataSource();
const callDataSource = new PostgresCallDataSource();
const fileDataSource = new PostgresFileDataSource();



const userAuthorization = new UserAuthorization(
  userDataSource,
  proposalDataSource,
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
  fileDataSource
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

const proposalMutations = new ProposalMutations(
  proposalDataSource,
  userAuthorization,
  eventBus
);

const fileQueries = new FileQueries(fileDataSource, userAuthorization);
const fileMutations = new FileMutations(
  fileDataSource,
  userAuthorization,
  eventBus
);

const context: BasicResolverContext = {
  queries: {
    user: userQueries,
    proposal: proposalQueries,
    review: reviewQueries,
    call: callQueries,
    file: fileQueries
  },
  mutations: {
    user: userMutations,
    proposal: proposalMutations,
    review: reviewMutations,
    call: callMutations,
    file: fileMutations
  }
};

export default context;
