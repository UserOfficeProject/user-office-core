import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { MailService } from '../eventHandlers/MailService/MailService';
import { ApplicationEvent } from '../events/applicationEvents';
import { SettingsId } from '../models/Settings';
import { ConnectionHasStatusAction } from '../models/StatusAction';
import {
  EmailActionConfig,
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithTemplate,
} from '../resolvers/types/StatusActionConfig';
import { WorkflowEngineProposalType } from '../workflowEngine/proposal';
import {
  EmailReadyType,
  getCoProposersAndFormatOutputForEmailSending,
  getInstrumentScientistsAndFormatOutputForEmailSending,
  getPIAndFormatOutputForEmailSending,
  getFapReviewersAndFormatOutputForEmailSending,
  getFapChairSecretariesAndFormatOutputForEmailSending,
  statusActionLogger,
  getOtherAndFormatOutputForEmailSending,
  getTechniqueScientistsAndFormatOutputForEmailSending,
  constructProposalStatusChangeEvent,
} from './statusActionUtils';

export const emailActionHandler = async (
  statusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[],
  options?: {
    statusActionsLogId?: number;
    loggedInUserId?: number;
    statusActionRecipients?: EmailStatusActionRecipients;
  }
) => {
  const { loggedInUserId, statusActionsLogId, statusActionRecipients } = {
    loggedInUserId: null,
    statusActionsLogId: null,
    statusActionRecipients: null,
    ...options,
  };
  const config = statusAction.config as EmailActionConfig;
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
    emailStatusActionRecipient(
      recipientWithTemplate,
      statusAction,
      proposals,
      statusActionsLogId,
      loggedInUserId
    );

    return;
  }
  await Promise.all(
    config.recipientsWithEmailTemplate.map(async (recipientWithTemplate) =>
      emailStatusActionRecipient(
        recipientWithTemplate,
        statusAction,
        proposals,
        statusActionsLogId,
        loggedInUserId
      )
    )
  );
};

export const emailStatusActionRecipient = async (
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate,
  statusAction: ConnectionHasStatusAction,
  proposals: WorkflowEngineProposalType[],
  statusActionsLogId?: number | null,
  loggedInUserId?: number | null
) => {
  const proposalPks = proposals.map((proposal) => proposal.primaryKey);
  const templateMessage = recipientWithTemplate.emailTemplate.id;
  const successfulMessage = !!statusActionsLogId
    ? 'Email successfully sent on status action replay'
    : 'Email successfully sent';
  const failMessage = !!statusActionsLogId
    ? 'Email(s) could not be sent on status action replay'
    : 'Email(s) could not be sent';
  switch (recipientWithTemplate.recipient.name) {
    case EmailStatusActionRecipients.PI: {
      const PIs = await getPIAndFormatOutputForEmailSending(
        proposals,
        recipientWithTemplate
      );

      await sendMail(
        PIs,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.PI,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        templateMessage,
        loggedInUserId
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
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.CO_PROPOSERS,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        templateMessage,
        loggedInUserId
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
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        templateMessage,
        loggedInUserId
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
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.FAP_REVIEWERS,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        templateMessage,
        loggedInUserId
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
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.FAP_CHAIR_AND_SECRETARY,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        templateMessage,
        loggedInUserId
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
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient: EmailStatusActionRecipients.USER_OFFICE,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        templateMessage,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.TECHNIQUE_SCIENTISTS: {
      const techniqueScientists =
        await getTechniqueScientistsAndFormatOutputForEmailSending(
          proposals,
          recipientWithTemplate
        );
      await sendMail(
        techniqueScientists,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.TECHNIQUE_SCIENTISTS,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        templateMessage,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.EXPERIMENT_SAFETY_REVIEWERS: {
      const adminDataSource = container.resolve<AdminDataSource>(
        Tokens.AdminDataSource
      );

      const experimentSafetyEmail = (
        await adminDataSource.getSetting(
          SettingsId.EXPERIMENT_SAFETY_REVIEW_EMAIL
        )
      )?.settingsValue;

      if (!experimentSafetyEmail) {
        logger.logError(
          'Could not send email(s) to the Experiment Safety team as the setting (EXPERIMENT_SAFETY_REVIEW_EMAIL) is not set.',
          { proposalEmailsSkipped: proposals }
        );

        break;
      }

      let experimentSafetyRecipients: EmailReadyType[];

      if (recipientWithTemplate.combineEmails) {
        experimentSafetyRecipients = [
          {
            id: recipientWithTemplate.recipient.name,
            email: experimentSafetyEmail,
            proposals: proposals,
            template: recipientWithTemplate.emailTemplate.id,
          },
        ];
      } else {
        experimentSafetyRecipients =
          await getOtherAndFormatOutputForEmailSending(
            proposals,
            recipientWithTemplate,
            experimentSafetyEmail
          );
      }

      await sendMail(
        experimentSafetyRecipients,
        statusActionLogger({
          connectionId: statusAction.connectionId,
          actionId: statusAction.actionId,
          statusActionsLogId,
          emailStatusActionRecipient:
            EmailStatusActionRecipients.EXPERIMENT_SAFETY_REVIEWERS,
          proposalPks,
        }),
        successfulMessage,
        failMessage,
        templateMessage,
        loggedInUserId
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

      for (const email of recipientWithTemplate.otherRecipientEmails) {
        const oRecipients = await getOtherAndFormatOutputForEmailSending(
          proposals,
          recipientWithTemplate,
          email
        );
        await sendMail(
          oRecipients,
          statusActionLogger({
            connectionId: statusAction.connectionId,
            actionId: statusAction.actionId,
            statusActionsLogId,
            emailStatusActionRecipient: EmailStatusActionRecipients.OTHER,
            proposalPks,
          }),
          successfulMessage,
          failMessage,
          templateMessage,
          loggedInUserId
        );
      }
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
  successfulMessage: string,
  failMessage: string,
  templateMessage: string,
  loggedInUserId?: number | null
) => {
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const loggingHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.LoggingHandler);
  const emailEventHandler = container.resolve<
    (event: ApplicationEvent) => Promise<void>
  >(Tokens.EmailEventHandler);

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
              techniques: recipientWithData.techniques,
              samples: recipientWithData.samples,
              hazards: recipientWithData.hazards,
            },
            recipients: [{ address: recipientWithData.email }],
          });
          logger.logInfo('Email sent:', {
            result: res,
          });

          for (const proposal of recipientWithData.proposals) {
            const evt = constructProposalStatusChangeEvent(
              proposal,
              loggedInUserId || null,
              `${successfulMessage} template: ${templateMessage} to: ${recipientWithData.email} recipient: ${recipientWithData.id}`,
              undefined
            );
            emailEventHandler(evt);
            loggingHandler(evt);
          }

          return res;
        } catch (err) {
          logger.logError('Could not send email', {
            error: err,
          });

          for (const proposal of recipientWithData.proposals) {
            const evt = constructProposalStatusChangeEvent(
              proposal,
              loggedInUserId || null,
              `${failMessage} template: ${templateMessage} to: ${recipientWithData.email} recipient: ${recipientWithData.id}`,
              undefined
            );
            emailEventHandler(evt);
            loggingHandler(evt);
          }
          throw err;
        }
      })
    );
    if (
      !!mailServiceResponse.length &&
      !mailServiceResponse.some(
        (result) => result.results.total_rejected_recipients !== 0
      )
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
