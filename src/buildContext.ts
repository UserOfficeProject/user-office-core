import { ResolverContext, BasicResolverContext } from "./context";
import UserQueries from "./queries/UserQueries";

// Site specific imports (only ESS atm)
import { RabbitMQMessageBroker } from "./messageBroker";
import PostgresUserDataSource from "./datasources/postgres/UserDataSource";
import PostgresProposalDataSource from "./datasources/postgres/ProposalDataSource";
import ProposalQueries from "./Queries/ProposalQueries";
import UserMutations from "./mutations/UserMutations";
import ProposalMutations from "./mutations/ProposalMutations";

// Site specific data sources (only ESS atm)
const userDataSource = new PostgresUserDataSource();
const proposalDataSource = new PostgresProposalDataSource();
const messageBroker = new RabbitMQMessageBroker();

// From this point nothing is site-specific
const userQueries = new UserQueries(userDataSource);
const userMutations = new UserMutations(userDataSource);
const proposalQueries = new ProposalQueries(proposalDataSource);
const proposalMutations = new ProposalMutations(
  proposalDataSource,
  messageBroker
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
