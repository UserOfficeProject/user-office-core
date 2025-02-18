import { ConnectionHasStatusAction } from '../models/StatusAction';
import { RabbitMQActionConfig } from '../resolvers/types/StatusActionConfig';
import { WorkflowEngineProposalType } from '../workflowEngine';
import { publishMessageToTheEventBus } from './statusActionUtils';

export const rabbitMQActionHandler = async (
  statusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  const config = statusAction.config as RabbitMQActionConfig;
  if (!config.exchanges?.length) {
    return;
  }

  const messageDescription =
    'Proposal event successfully sent to the message broker';

  return await Promise.all(
    config.exchanges.map((exchange) =>
      publishMessageToTheEventBus(proposals, messageDescription, exchange)
    )
  );
};
