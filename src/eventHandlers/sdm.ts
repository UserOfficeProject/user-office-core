import { ApplicationEvent } from "../events/applicationEvents";
import { RabbitMQMessageBroker } from "../messageBroker";

export default function createHandler() {
  // Handler to notify the SDM system that a proposal has been accepted
  
  return async function sdmHandler(event: ApplicationEvent) {
    const rabbitMQ = new RabbitMQMessageBroker();

    switch (event.type) {
      case "PROPOSAL_ACCEPTED": {
        const { proposal } = event;
        const message = [proposal.id, proposal.status];
        const json = JSON.stringify(message);
        rabbitMQ.sendMessage(json);
      }
    }
  };
}
