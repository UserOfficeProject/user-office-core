import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { MailService } from '../eventHandlers/MailService/MailService';
import { ConnectionHasStatusAction } from '../models/ProposalStatusAction';
import { SettingsId } from '../models/Settings';
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
  getFapReviewersAndFormatOutputForEmailSending,
  publishMessageToTheEventBus,
  getFapChairSecretariesAndFormatOutputForEmailSending,
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

        case EmailStatusActionRecipients.FAP_REVIEWERS: {
          const FRs = await getFapReviewersAndFormatOutputForEmailSending(
            proposals,
            recipientWithTemplate
          );

          sendMail(FRs);

          break;
        }

        case EmailStatusActionRecipients.FAP_CHAIR_AND_SECRETARY: {
          const FCSs =
            await getFapChairSecretariesAndFormatOutputForEmailSending(
              proposals,
              recipientWithTemplate
            );

          sendMail(FCSs);

          break;
        }

        case EmailStatusActionRecipients.USER_OFFICE: {
          const adminDataSource = container.resolve<AdminDataSource>(
            Tokens.AdminDataSource
          );

          const userOfficeEmail = (
            await adminDataSource.getSetting(SettingsId.USER_OFFICE_EMAIL)
          )?.settingsValue;

          if (!userOfficeEmail) {
            logger.logError(
              'Could not send email(s) to the User Office as the setting (USER_OFFICE_EMAIL) is not set.',
              { proposalEmailsSkipped: proposals }
            );

            break;
          }

          let uoRecipient: EmailReadyType[];

          if (recipientWithTemplate.combineEmails) {
            uoRecipient = [
              {
                id: recipientWithTemplate.recipient.name,
                email: userOfficeEmail,
                proposals: proposals,
                template: recipientWithTemplate.emailTemplate.id,
              },
            ];
          } else {
            const usersDataSource: UserDataSource = container.resolve(
              Tokens.UserDataSource
            );

            const recipientPromises = proposals.map(async (proposal) => ({
              id: recipientWithTemplate.recipient.name,
              email: userOfficeEmail,
              proposals: [proposal],
              template: recipientWithTemplate.emailTemplate.id,
              pi:
                (await usersDataSource.getBasicUserInfo(proposal.proposerId)) ||
                null,
              coProposers:
                (await usersDataSource.getProposalUsers(proposal.primaryKey)) ||
                null,
            }));

            uoRecipient = await Promise.all(recipientPromises);
          }

          sendMail(uoRecipient);

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
            pi: recipientWithData.pi,
            coProposers: recipientWithData.coProposers,
            // The firstName, lastName, preferredName of the main recipient
            firstName: recipientWithData.firstName,
            lastName: recipientWithData.lastName,
            preferredName: recipientWithData.preferredName,
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
