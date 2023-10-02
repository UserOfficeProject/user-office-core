import { logger } from '@user-office-software/duo-logger';

import {
  getProposalMessageData,
  getRabbitMQMessageBroker,
} from '../eventHandlers/messageBroker';
import { Event } from '../events/event.enum';
import { ConnectionHasStatusAction } from '../models/ProposalStatusAction';
import { RabbitMQActionConfig } from '../resolvers/types/ProposalStatusActionConfig';
import { WorkflowEngineProposalType } from '../workflowEngine';

export const rabbitMQActionHandler = async (
  proposalStatusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  const config = proposalStatusAction.config as RabbitMQActionConfig;
  const rabbitMQ = await getRabbitMQMessageBroker();
  if (!config.exchanges?.length) {
    return;
  }

  Promise.all(
    config.exchanges.map((exchange) => {
      Promise.all(
        proposals.map(async (proposal) => {
          const jsonMessage = await getProposalMessageData(proposal);

          // NOTE: For now we only sent to the default exchange
          rabbitMQ.sendMessageToExchange(
            exchange,
            Event.PROPOSAL_STATUS_ACTION_EXECUTED,
            jsonMessage
          );

          logger.logDebug(
            'Proposal event successfully sent to the message broker',
            {
              exchange,
              eventType: Event.PROPOSAL_STATUS_ACTION_EXECUTED,
              fullProposalMessage: jsonMessage,
            }
          );
        })
      );
    })
  );
};
