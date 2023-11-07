import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
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
  publishMessageToTheEventBus,
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

          await sendMail(PIs);

          break;
        }

        case EmailStatusActionRecipients.CO_PROPOSERS: {
          const CPs = await getCoProposersAndFormatOutputForEmailSending(
            proposals,
            recipientWithTemplate
          );

          await sendMail(CPs);

          break;
        }

        case EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS: {
          const ISs =
            await getInstrumentScientistsAndFormatOutputForEmailSending(
              proposals,
              recipientWithTemplate
            );

          await sendMail(ISs);

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

        case EmailStatusActionRecipients.OTHER: {
          if (!recipientWithTemplate.otherRecipientEmails?.length) {
            break;
          }

          const otherRecipients: EmailReadyType[] =
            recipientWithTemplate.otherRecipientEmails.map((email) => ({
              id: recipientWithTemplate.recipient.name,
              email: email,
              proposals: proposals,
              template: recipientWithTemplate.emailTemplate.id,
            }));

          await sendMail(otherRecipients);

          break;
        }

        default:
          break;
      }
    })
  );
};

const sendMail = async (recipientsWithData: EmailReadyType[]) => {
  const mailService = container.resolve<MailService>(Tokens.MailService);

  await Promise.all(
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
        .then(async (res) => {
          logger.logInfo('Email sent:', {
            result: res,
          });

          const messageDescription = `Email successfully sent to: ${recipientWithData.email}`;
          await publishMessageToTheEventBus(
            recipientWithData.proposals,
            messageDescription
          );
        })
        .catch((err) => {
          logger.logError('Could not send email', {
            error: err,
          });
        });
    })
  );
};
