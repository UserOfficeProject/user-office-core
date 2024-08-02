import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { MailService } from '../eventHandlers/MailService/MailService';
import { ConnectionHasStatusAction } from '../models/ProposalStatusAction';
import { SettingsId } from '../models/Settings';
import {
  EmailActionConfig,
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithTemplate,
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
  statusActionLogger,
} from './statusActionUtils';

export const emailActionHandler = async (
  proposalStatusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[],
  options?: {
    statusActionsBy?: number;
    parentStatusActionsLogId?: number;
    statusActionRecipients?: EmailStatusActionRecipients;
  }
) => {
  const { statusActionsBy, parentStatusActionsLogId, statusActionRecipients } =
    {
      statusActionsBy: null,
      parentStatusActionsLogId: null,
      statusActionRecipients: null,
      ...options,
    };
  const config = proposalStatusAction.config as EmailActionConfig;
  if (!config.recipientsWithEmailTemplate?.length) {
    return;
  }

  if (statusActionRecipients) {
    const recipientWithTemplate = config.recipientsWithEmailTemplate.find(
      (value) => value.recipient.name === statusActionRecipients
    );

    if (!recipientWithTemplate) {
      throw new Error(
        `Provide status action recipient does not match any available email recipients 
        ${statusActionRecipients}`
      );
    }
    emailStatusActionRecipients(
      recipientWithTemplate,
      proposalStatusAction,
      proposals,
      statusActionsBy,
      parentStatusActionsLogId,
      recipientWithTemplate.recipient.name
    );

    return;
  }
  await Promise.all(
    config.recipientsWithEmailTemplate.map(async (recipientWithTemplate) =>
      emailStatusActionRecipients(
        recipientWithTemplate,
        proposalStatusAction,
        proposals,
        statusActionsBy
      )
    )
  );
};

export const emailStatusActionRecipients = async (
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate,
  proposalStatusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[],
  statusActionsBy: number | null = null,
  parentStatusActionsLogId: number | null = null,
  statusActionRecipients?: EmailStatusActionRecipients
) => {
  switch (statusActionRecipients || recipientWithTemplate.recipient.name) {
    case EmailStatusActionRecipients.PI: {
      const PIs = await getPIAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );

      await sendMail(
        PIs,
        statusActionLogger({
          connectionId: proposalStatusAction.connectionId,
          actionId: proposalStatusAction.actionId,
          statusActionsBy,
          parentStatusActionsLogId,
          statusActionsStep: EmailStatusActionRecipients.PI,
          proposalPks: proposals.map((proposal) => proposal.primaryKey),
        })
      );

      break;
    }

    case EmailStatusActionRecipients.CO_PROPOSERS: {
      const CPs = await getCoProposersAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );
      await sendMail(
        CPs,
        statusActionLogger({
          connectionId: proposalStatusAction.connectionId,
          actionId: proposalStatusAction.actionId,
          statusActionsBy,
          parentStatusActionsLogId,
          statusActionsStep: EmailStatusActionRecipients.CO_PROPOSERS,
          proposalPks: proposals.map((proposal) => proposal.primaryKey),
        })
      );

      break;
    }

    case EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS: {
      const ISs = await getInstrumentScientistsAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );

      await sendMail(
        ISs,
        statusActionLogger({
          connectionId: proposalStatusAction.connectionId,
          actionId: proposalStatusAction.actionId,
          statusActionsBy,
          parentStatusActionsLogId,
          statusActionsStep: EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS,
          proposalPks: proposals.map((proposal) => proposal.primaryKey),
        })
      );

      break;
    }

    case EmailStatusActionRecipients.FAP_REVIEWERS: {
      const FRs = await getFapReviewersAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );

      await sendMail(
        FRs,
        statusActionLogger({
          connectionId: proposalStatusAction.connectionId,
          actionId: proposalStatusAction.actionId,
          statusActionsBy,
          parentStatusActionsLogId,
          statusActionsStep: EmailStatusActionRecipients.FAP_REVIEWERS,
          proposalPks: proposals.map((proposal) => proposal.primaryKey),
        })
      );

      break;
    }

    case EmailStatusActionRecipients.FAP_CHAIR_AND_SECRETARY: {
      const FCSs = await getFapChairSecretariesAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );

      await sendMail(
        FCSs,
        statusActionLogger({
          connectionId: proposalStatusAction.connectionId,
          actionId: proposalStatusAction.actionId,
          statusActionsBy,
          parentStatusActionsLogId,
          statusActionsStep:
            EmailStatusActionRecipients.FAP_CHAIR_AND_SECRETARY,
          proposalPks: proposals.map((proposal) => proposal.primaryKey),
        })
      );

      break;
    }

    case EmailStatusActionRecipients.USER_OFFICE: {
      const adminDataSource = container.resolve<AdminDataSource>(
        Tokens.AdminDataSource
      );

      const instrumentDataSource = container.resolve<InstrumentDataSource>(
        Tokens.InstrumentDataSource
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
          instruments: await instrumentDataSource.getInstrumentsByProposalPk(
            proposal.primaryKey
          ),
          pi:
            (await usersDataSource.getBasicUserInfo(proposal.proposerId)) ||
            null,
          coProposers:
            (await usersDataSource.getProposalUsers(proposal.primaryKey)) ||
            null,
        }));

        uoRecipient = await Promise.all(recipientPromises);
      }

      await sendMail(
        uoRecipient,
        statusActionLogger({
          connectionId: proposalStatusAction.connectionId,
          actionId: proposalStatusAction.actionId,
          statusActionsBy,
          parentStatusActionsLogId,
          statusActionsStep: EmailStatusActionRecipients.USER_OFFICE,
          proposalPks: proposals.map((proposal) => proposal.primaryKey),
        })
      );

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

      await sendMail(
        otherRecipients,
        statusActionLogger({
          connectionId: proposalStatusAction.connectionId,
          actionId: proposalStatusAction.actionId,
          statusActionsBy,
          parentStatusActionsLogId,
          statusActionsStep: EmailStatusActionRecipients.OTHER,
          proposalPks: proposals.map((proposal) => proposal.primaryKey),
        })
      );

      break;
    }

    default:
      break;
  }
};

const sendMail = async (
  recipientsWithData: EmailReadyType[],
  statusActionLogger: (actionSuccessful: boolean, message: string) => void
) => {
  const mailService = container.resolve<MailService>(Tokens.MailService);

  return await Promise.allSettled(
    recipientsWithData.map(async (recipientWithData) => {
      return await mailService
        .sendMail({
          content: {
            template_id: recipientWithData.template,
          },
          substitution_data: {
            proposals: recipientWithData.proposals,
            pi: recipientWithData.pi,
            coProposers: recipientWithData.coProposers,
            instruments: recipientWithData.instruments,
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
          publishMessageToTheEventBus(
            recipientWithData.proposals,
            messageDescription
          );

          return res;
        })
        .catch((err) => {
          logger.logError('Could not send email', {
            error: err,
          });

          throw err;
        });
    })
  ).then((results) => {
    const errors = results.filter((result) => result.status === 'rejected');
    const fulfilled = results.filter((result) => result.status === 'fulfilled');

    if (errors.length < 1 && fulfilled.length > 0) {
      statusActionLogger(true, 'Email(s) successfully sent');

      return results;
    }

    statusActionLogger(false, 'Email(s) could not be sent');

    return results;
  });
};
