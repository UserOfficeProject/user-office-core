import { logger } from '@user-office-software/duo-logger';

import { ProposalStatusAction } from '../models/ProposalStatusAction';
import { WorkflowEngineProposalType } from '../workflowEngine';

export const rabbitMQActionHandler = (
  proposalStatusAction: ProposalStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  logger.logInfo('this is rabbitmq action type', {});
};
