import { logger } from '@user-office-software/duo-logger';

import { ConnectionHasStatusAction } from '../models/ProposalStatusAction';
import { WorkflowEngineProposalType } from '../workflowEngine';

export const rabbitMQActionHandler = (
  proposalStatusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  logger.logInfo('this is rabbitmq action type', {});
};
