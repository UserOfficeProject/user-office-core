import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { MailService } from '../eventHandlers/MailService/MailService';
import { ConnectionHasStatusAction } from '../models/ProposalStatusAction';
import {
  EmailActionConfig,
  EmailStatusActionRecipients,
} from '../resolvers/types/ProposalStatusActionConfig';
import { WorkflowEngineProposalType } from '../workflowEngine';
import {
  EmailReadyType,
  getCoProposersAndFormatOutputForEmailSending,
  getInstrumentScientistsAndFormatOutputForEmailSending,
  getPIAndFormatOutputForEmailSending,
  getSEPReviewersAndFormatOutputForEmailSending,
} from './statusActionUtils';

export const emailActionHandler = async (
  proposalStatusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  const config = proposalStatusAction.config as EmailActionConfig;
  if (!config.recipientsWithEmailTemplate?.length) {
    return;
  }

  await Promise.all(
    config.recipientsWithEmailTemplate.map(async (recipientWithTemplate) => {
      switch (recipientWithTemplate.recipient.name) {
        case EmailStatusActionRecipients.PI: {
          const PIs = await getPIAndFormatOutputForEmailSending(
            proposals,
            recipientWithTemplate
          );

          sendMail(PIs);

          break;
        }

        case EmailStatusActionRecipients.CO_PROPOSERS: {
          const CPs = await getCoProposersAndFormatOutputForEmailSending(
            proposals,
            recipientWithTemplate
          );

          sendMail(CPs);

          break;
        }

        case EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS: {
          const ISs =
            await getInstrumentScientistsAndFormatOutputForEmailSending(
              proposals,
              recipientWithTemplate
            );

          sendMail(ISs);

          break;
        }

        case EmailStatusActionRecipients.SEP_REVIEWERS: {
          const SRs = await getSEPReviewersAndFormatOutputForEmailSending(
            proposals,
            recipientWithTemplate
          );

          sendMail(SRs);

          break;
        }

        default:
          break;
      }
    })
  );

  await markStatusActionAsExecuted(proposalStatusAction);
};

const markStatusActionAsExecuted = async (
  proposalStatusAction: ConnectionHasStatusAction
) => {
  const proposalSettingsDataSource: ProposalSettingsDataSource =
    container.resolve(Tokens.ProposalSettingsDataSource);

  await proposalSettingsDataSource.updateConnectionStatusAction({
    ...proposalStatusAction,
    executed: true,
  });
};

const sendMail = (recipientsWithData: EmailReadyType[]) => {
  const mailService = container.resolve<MailService>(Tokens.MailService);

  Promise.all(
    recipientsWithData.map(async (recipientWithData) => {
      return mailService
        .sendMail({
          content: {
            template_id: recipientWithData.template,
          },
          substitution_data: {
            proposals: recipientWithData.proposals,
          },
          recipients: [{ address: recipientWithData.email }],
        })
        .then((res) => {
          logger.logInfo('Email sent:', {
            result: res,
          });
        })
        .catch((err) => {
          logger.logError('Could not send email', {
            error: err,
          });
        });
    })
  );
};
