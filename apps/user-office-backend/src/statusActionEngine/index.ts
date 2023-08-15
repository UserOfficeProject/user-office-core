import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import ProposalSettingsDataSource from '../datasources/postgres/ProposalSettingsDataSource';
import { MailService } from '../eventHandlers/MailService/MailService';
import {
  ProposalStatusAction,
  ProposalStatusActionType,
} from '../models/ProposalStatusAction';
import { EmailActionConfig } from '../resolvers/types/ProposalStatusActionConfig';
import {
  WorkflowEngineProposalType,
  getProposalWorkflowConnectionByStatusId,
} from '../workflowEngine';

const proposalSettingsDataSource = container.resolve(
  ProposalSettingsDataSource
);

export const statusActionEngine = async (
  proposals: WorkflowEngineProposalType[]
): Promise<undefined> => {
  // TODO: This should be reviewed and see if proposals can be grouped by workflowId or callId.
  // We can have selected proposals that changed statuses from different calls and different workflows(test this scenario and develop a solution).
  const [currentConnection] = await getProposalWorkflowConnectionByStatusId(
    proposals[0].workflowId,
    proposals[0].statusId
  );

  const proposalStatusActions =
    await proposalSettingsDataSource.getStatusActionsByConnectionId(
      currentConnection.id,
      currentConnection.proposalWorkflowId
    );

  if (!proposalStatusActions?.length) {
    return;
  }

  Promise.all(
    proposalStatusActions.map(async (proposalStatusAction) => {
      if (!proposalStatusAction.id || !proposalStatusAction.type) {
        return;
      }

      switch (proposalStatusAction.type) {
        case ProposalStatusActionType.EMAIL:
          emailActionHandler(proposalStatusAction, proposals);
          break;

        case ProposalStatusActionType.RABBITMQ:
          rabbitMQActionHandler(proposalStatusAction, proposals);
          break;

        default:
          break;
      }
    })
  );

  return undefined;
};

const emailActionHandler = (
  proposalStatusAction: ProposalStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  const mailService = container.resolve<MailService>(Tokens.MailService);

  const proposalsEmailData = proposals.map((proposal) => {
    return {
      proposalId: proposal.proposalId,
      proposalTitme: proposal.title,
    };
  });

  const config = proposalStatusAction.config as EmailActionConfig;

  // TODO: Get the email addresses from config recipients
  const emailRecipients: { address: string }[] = [];

  logger.logInfo('this is email action type', {});

  // TODO: Sending emails should go here after the recipients are fetched.
};

const rabbitMQActionHandler = (
  proposalStatusAction: ProposalStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  logger.logInfo('this is rabbitmq action type', {});
};
