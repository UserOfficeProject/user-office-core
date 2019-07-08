import { BasicResolverContext } from "./context";
import UserQueries from "./queries/UserQueries";

// Site specific imports (only ESS atm)
import PostgresUserDataSource from "./datasources/postgres/UserDataSource";
import PostgresProposalDataSource from "./datasources/postgres/ProposalDataSource";
import ProposalQueries from "./queries/ProposalQueries";
import UserMutations from "./mutations/UserMutations";
import ProposalMutations from "./mutations/ProposalMutations";
import { UserAuthorization } from "./utils/UserAuthorization";
import { EventBus } from "./events/eventBus";
import { ApplicationEvent } from "./events/applicationEvents";
import createEventHandlers from "./eventHandlers";

// Site specific data sources and event handlers (only ESS atm)
const userDataSource = new PostgresUserDataSource();
const proposalDataSource = new PostgresProposalDataSource();
const userAuthorization = new UserAuthorization(
  userDataSource,
  proposalDataSource
);

const eventHandlers = createEventHandlers(userDataSource);

// From this point nothing is site-specific
const eventBus = new EventBus<ApplicationEvent>(eventHandlers);

const userQueries = new UserQueries(userDataSource, userAuthorization);
const userMutations = new UserMutations(userDataSource, userAuthorization);
const proposalQueries = new ProposalQueries(
  proposalDataSource,
  userAuthorization
);

const proposalMutations = new ProposalMutations(
  proposalDataSource,
  userAuthorization,
  eventBus
);

const context: BasicResolverContext = {
  queries: {
    user: userQueries,
    proposal: proposalQueries
  },
  mutations: {
    user: userMutations,
    proposal: proposalMutations
  }
};

export default context;
