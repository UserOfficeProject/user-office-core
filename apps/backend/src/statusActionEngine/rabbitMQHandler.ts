import { container } from 'tsyringe';

import { constructProposalStatusChangeEvent } from './statusActionUtils';
import { Tokens } from '../config/Tokens';
import { ApplicationEvent } from '../events/applicationEvents';
import { ConnectionHasStatusAction } from '../models/StatusAction';
import { RabbitMQActionConfig } from '../resolvers/types/StatusActionConfig';
import { WorkflowEngineProposalType } from '../workflowEngine/proposal';

export const rabbitMQActionHandler = async (
  statusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  const postToMessageQueue = await container.resolve<
    Promise<(event: ApplicationEvent) => Promise<void>>
  >(Tokens.PostToMessageQueue);

  const loggingHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.LoggingHandler);

  const config = statusAction.config as RabbitMQActionConfig;
  if (!config.exchanges?.length) {
    return;
  }

  const messageDescription =
    'Proposal event successfully sent to the message broker';

  return await Promise.all(
    config.exchanges.map(async (exchange) => {
      for (const proposal of proposals) {
        const evt = constructProposalStatusChangeEvent(
          proposal,
          null,
          messageDescription,
          exchange
        );
        postToMessageQueue(evt);
        loggingHandler(evt);
      }
    })
  );
};
