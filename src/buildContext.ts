import { BasicResolverContext } from "./context";
import UserQueries from "./queries/UserQueries";

// Site specific imports (only ESS atm)
import PostgresUserDataSource from "./datasources/postgres/UserDataSource";
import PostgresProposalDataSource from "./datasources/postgres/ProposalDataSource";
import ProposalQueries from "./Queries/ProposalQueries";
import UserMutations from "./mutations/UserMutations";
import ProposalMutations from "./mutations/ProposalMutations";
import { EventBus } from "./events/eventBus";
import { ApplicationEvent } from "./events/applicationEvents";
import { RabbitMQMessageBroker } from "./messageBroker";

// Site specific data sources (only ESS atm)
const userDataSource = new PostgresUserDataSource();
const proposalDataSource = new PostgresProposalDataSource();

// Handler to send email to proposers in accepted proposal
async function emailHandler(event: ApplicationEvent) {
  function sendEmail(address: string, topic: string, message: string) {}

  switch (event.type) {
    case "PROPOSAL_ACCEPTED": {
      const proposal = event.proposal;
      const participants = await userDataSource.getProposalUsers(proposal.id);

      for (const { firstname, lastname, email } of participants) {
        const topic = "Congrats!";
        const message = `Dear ${firstname} ${lastname}, your proposal has been accepted.`;
        sendEmail(email, topic, message);
      }

      return;
    }

    case "PROPOSAL_REJECTED": {
      const proposal = event.proposal;
      const participants = await userDataSource.getProposalUsers(proposal.id);

      for (const { firstname, lastname, email } of participants) {
        const topic = "Tough luck!";
        const message = `Sorry ${firstname} ${lastname}, your proposal was rejected because: ${
          event.reason
        }`;
        sendEmail(email, topic, message);
      }

      return;
    }
  }
}

// Handler to notify the SDM system that a proposal has been accepted
async function sdmHandler(event: ApplicationEvent) {
  const rabbitMQ = new RabbitMQMessageBroker();

  switch (event.type) {
    case "PROPOSAL_ACCEPTED": {
      const { proposal } = event;
      const message = [proposal.id, proposal.status];
      const json = JSON.stringify(message);
      rabbitMQ.sendMessage(json);
    }
  }
}

// Init event bus and add event handlers
const eventBus = new EventBus<ApplicationEvent>();
eventBus.addHandler(emailHandler);
eventBus.addHandler(sdmHandler);

// From this point nothing is site-specific
const userQueries = new UserQueries(userDataSource);
const userMutations = new UserMutations(userDataSource);
const proposalQueries = new ProposalQueries(proposalDataSource);
const proposalMutations = new ProposalMutations(proposalDataSource, eventBus);

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
