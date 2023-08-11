import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import ProposalSettingsDataSource from '../datasources/postgres/ProposalSettingsDataSource';
import { MailService } from '../eventHandlers/MailService/MailService';
import { ProposalStatusActionType } from '../models/ProposalStatusAction';
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
  console.log(proposals);

  const [currentConnection] = await getProposalWorkflowConnectionByStatusId(
    proposals[0].workflowId,
    proposals[0].statusId
  );

  const proposalStatusActions =
    await proposalSettingsDataSource.getStatusActionsByConnectionId(
      currentConnection.id,
      currentConnection.proposalWorkflowId
    );

  console.log(currentConnection);
  console.log(proposalStatusActions);

  Promise.all(
    proposalStatusActions.map(async (proposalStatusAction) => {
      if (!proposalStatusAction.id || !proposalStatusAction.type) {
        return;
      }

      switch (proposalStatusAction.type) {
        case ProposalStatusActionType.EMAIL:
          console.log('this is email action type');

          const mailService = container.resolve<MailService>(
            Tokens.MailService
          );

          mailService
            .sendMail({
              content: {
                template_id: 'review-reminder-multiple',
              },
              substitution_data: {
                firstName: 'Martin',
                lastName: 'Trajanovski',
                // NOTE: This is example data from a draft email template
                proposals: [
                  {
                    proposalNumber: '123123',
                    proposalLink:
                      'http://localhost:3000/?modalTab=1&reviewModal=1',
                    proposalTitle: 'Test title',
                  },
                  {
                    proposalNumber: '123123',
                    proposalLink:
                      'http://localhost:3000/?modalTab=1&reviewModal=2',
                    proposalTitle: 'Test title',
                  },
                ],
              },
              recipients: [
                { address: 'martin.trajanovski@sigmatechnology.com' },
              ],
            })
            .then((res: any) => {
              logger.logInfo('Email sent:', {
                result: res,
              });
            })
            .catch((err: string) => {
              logger.logError('Could not send email', {
                error: err,
              });
            });
          break;

        case ProposalStatusActionType.RABBITMQ:
          console.log('this is rabbitmq action type');
          break;

        default:
          break;
      }
    })
  );

  return undefined;
};
