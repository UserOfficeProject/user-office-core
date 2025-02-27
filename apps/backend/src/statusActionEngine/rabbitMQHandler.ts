import { ConnectionHasStatusAction } from '../models/StatusAction';
import { RabbitMQActionConfig } from '../resolvers/types/ProposalStatusActionConfig';
import { WorkflowEngineProposalType } from '../workflowEngine';
import { publishMessageToTheEventBus } from './statusActionUtils';

export const rabbitMQActionHandler = async (
  proposalStatusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  const config = proposalStatusAction.config as RabbitMQActionConfig;
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
