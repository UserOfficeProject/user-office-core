import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalSettingsDataSource } from '../datasources/ProposalSettingsDataSource';
import { MailService } from '../eventHandlers/MailService/MailService';
import { ProposalStatusAction } from '../models/ProposalStatusAction';
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
  proposalStatusAction: ProposalStatusAction,
  proposals: WorkflowEngineProposalType[]
) => {
  const config = proposalStatusAction.config as EmailActionConfig;
  if (!config.recipientsWithTemplate?.length) {
    return;
  }

  await Promise.all(
    config.recipientsWithTemplate.map(async (recipientWithTemplate) => {
      switch (recipientWithTemplate.recipient) {
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
  proposalStatusAction: ProposalStatusAction
) => {
  const proposalSettingsDataSource: ProposalSettingsDataSource =
    container.resolve(Tokens.ProposalSettingsDataSource);

  await proposalSettingsDataSource.updateStatusAction({
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
