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
    statusActionsLogId?: number;
    statusActionsBy?: number;
    statusActionRecipients?: EmailStatusActionRecipients;
  }
) => {
  const { statusActionsBy, statusActionsLogId, statusActionRecipients } = {
    statusActionsBy: null,
    statusActionsLogId: null,
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
        `Provided status action recipient does not match any available email recipients 
        ${statusActionRecipients}`
      );
    }
    emailStatusActionRecipients(
      recipientWithTemplate,
      proposalStatusAction,
      proposals,
      statusActionsLogId,
      statusActionsBy,
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
        statusActionsLogId,
        statusActionsBy
      )
    )
  );
};

export const emailStatusActionRecipients = async (
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate,
  proposalStatusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[],
  statusActionsLogId?: number | null,
  statusActionsBy?: number | null,
  statusActionRecipients?: EmailStatusActionRecipients
) => {
  const proposalPks = proposals.map((proposal) => proposal.primaryKey);
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
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.PI,
          proposalPks,
        }),
        !!statusActionsLogId,
        statusActionsBy
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
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.CO_PROPOSERS,
          proposalPks,
        }),
        !!statusActionsLogId,
        statusActionsBy
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
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS,
          proposalPks,
        }),
        !!statusActionsLogId,
        statusActionsBy
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
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.FAP_REVIEWERS,
          proposalPks,
        }),
        !!statusActionsLogId,
        statusActionsBy
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
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.FAP_CHAIR_AND_SECRETARY,
          proposalPks,
        }),
        !!statusActionsLogId,
        statusActionsBy
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
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.USER_OFFICE,
          proposalPks,
        }),
        !!statusActionsLogId,
        statusActionsBy
      );

      break;
    }

    case EmailStatusActionRecipients.OTHER: {
      if (!recipientWithTemplate.otherRecipientEmails?.length) {
        logger.logError(
          `Could not execute status action email because no ${EmailStatusActionRecipients.OTHER} recipience set on proposals`,
          { ...proposalPks }
        );
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
          emailStatusActionRecipient: EmailStatusActionRecipients.OTHER,
          proposalPks,
          statusActionsLogId,
        }),
        !!statusActionsLogId,
        statusActionsBy
      );

      break;
    }

    default:
      break;
  }
};

const sendMail = async (
  recipientsWithData: EmailReadyType[],
  statusActionLogger: (
    actionSuccessful: boolean,
    message: string
  ) => Promise<void>,
  isStatusActionReplay: boolean,
  statusActionsBy?: number | null
) => {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const successfulMessage = isStatusActionReplay
    ? 'Email successfully sent on status action replay'
    : 'Email successfully sent';
  const failMessage = isStatusActionReplay
    ? 'Email(s) could not be sent on status action replay'
    : 'Email(s) could not be sent';

  if (!recipientsWithData.length) {
    logger.logInfo('Could not send email(s) because there are no recipients.', {
      recipientsWithData,
    });

    return;
  }
  try {
    const mailServiceResponse = await Promise.all(
      recipientsWithData.map(async (recipientWithData) => {
        try {
          const res = await mailService.sendMail({
            content: {
              template_id: recipientWithData.template,
            },
            substitution_data: {
              proposals: recipientWithData.proposals,
              pi: recipientWithData.pi,
              coProposers: recipientWithData.coProposers,
              instruments: recipientWithData.instruments,
              firstName: recipientWithData.firstName,
              lastName: recipientWithData.lastName,
              preferredName: recipientWithData.preferredName,
            },
            recipients: [{ address: recipientWithData.email }],
          });
          logger.logInfo('Email sent:', {
            result: res,
          });

          await publishMessageToTheEventBus(
            recipientWithData.proposals,
            `${successfulMessage} to: ${recipientWithData.email} recipient: ${recipientWithData.id}`,
            undefined,
            statusActionsBy || undefined
          );

          return res;
        } catch (err) {
          logger.logError('Could not send email', {
            error: err,
          });

          await publishMessageToTheEventBus(
            recipientWithData.proposals,
            `${failMessage} to: ${recipientWithData.email} recipient: ${recipientWithData.id}`,
            undefined,
            statusActionsBy || undefined
          );
          throw err;
        }
      })
    );
    if (
      !!mailServiceResponse.length &&
      mailServiceResponse[0].results.total_rejected_recipients === 0
    ) {
      await statusActionLogger(true, successfulMessage);

      return;
    }
    await statusActionLogger(false, failMessage);
  } catch (err) {
    logger.logInfo('Status action email(s) not sent:', {
      err,
    });
    await statusActionLogger(false, failMessage);
  }
};
