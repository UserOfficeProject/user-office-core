import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import {
  constructExperimentSafetyStatusChangeEvent,
  EmailReadyType,
  getExperimentSafetyReviewersAndFormatOutputForEmailSending,
  getInstrumentScientistsAndFormatOutputForEmailSending,
  getPIAndFormatOutputForEmailSending,
} from './utils';
import { Tokens } from '../../../config/Tokens';
import { AdminDataSource } from '../../../datasources/AdminDataSource';
import { ApplicationEvent } from '../../../events/applicationEvents';
import { ExperimentSafety } from '../../../models/Experiment';
import { SettingsId } from '../../../models/Settings';
import { ConnectionHasStatusAction } from '../../../models/StatusAction';
import {
  EmailActionConfig,
  EmailStatusActionRecipients,
  EmailStatusActionRecipientsWithTemplate,
} from '../../../resolvers/types/StatusActionConfig';
import { MailService } from '../../MailService/MailService';

export const emailActionHandler = async (
  statusAction: ConnectionHasStatusAction,
  experimentSafeties: ExperimentSafety[],
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

    await Promise.all(
      experimentSafeties.map((experimentSafety) =>
        emailStatusActionRecipient(
          recipientWithTemplate,
          experimentSafety,
          statusActionsLogId,
          loggedInUserId
        )
      )
    );

    return;
  }

  await Promise.all(
    experimentSafeties.flatMap((experimentSafety) =>
      config.recipientsWithEmailTemplate.map((recipientWithTemplate) =>
        emailStatusActionRecipient(
          recipientWithTemplate,
          experimentSafety,
          statusActionsLogId,
          loggedInUserId
        )
      )
    )
  );
};

export const emailStatusActionRecipient = async (
  recipientWithTemplate: EmailStatusActionRecipientsWithTemplate,
  experimentSafety: ExperimentSafety,
  statusActionsLogId?: number | null,
  loggedInUserId?: number | null
) => {
  const emailTemplateId = recipientWithTemplate.emailTemplate.id;
  const successfulMessage = statusActionsLogId
    ? 'Email successfully sent on status action replay'
    : 'Email successfully sent';
  const failMessage = statusActionsLogId
    ? 'Email(s) could not be sent on status action replay'
    : 'Email(s) could not be sent';
  switch (recipientWithTemplate.recipient.name) {
    case EmailStatusActionRecipients.PI: {
      const PI = await getPIAndFormatOutputForEmailSending(
        experimentSafety,
        recipientWithTemplate
      );

      if (!PI) {
        logger.logError(
          `Could not send email to the PI because no PI was found for experiment safety with pk ${experimentSafety.experimentSafetyPk}`,
          { experimentSafetyPk: experimentSafety.experimentSafetyPk }
        );
        break;
      }

      await sendMail(
        [PI],
        async () => {},
        successfulMessage,
        failMessage,
        emailTemplateId,
        loggedInUserId
      );

      break;
    }

    case EmailStatusActionRecipients.INSTRUMENT_SCIENTISTS: {
      const ISs = await getInstrumentScientistsAndFormatOutputForEmailSending(
        experimentSafety,
        recipientWithTemplate
      );

      if (!ISs?.length) {
        logger.logError(
          `Could not send email to the Instrument Scientists because no Instrument Scientists were found for experiment safety with pk ${experimentSafety.experimentSafetyPk}`,
          { experimentSafetyPk: experimentSafety.experimentSafetyPk }
        );
        break;
      }

      await sendMail(
        ISs,
        async () => {},
        successfulMessage,
        failMessage,
        emailTemplateId,
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
          { experimentSafetyEmailsSkipped: experimentSafety }
        );

        break;
      }

      const experimentSafetyRecipients =
        await getExperimentSafetyReviewersAndFormatOutputForEmailSending(
          experimentSafety,
          recipientWithTemplate
        );

      if (!experimentSafetyRecipients?.length) {
        logger.logError(
          'Could not send email to the Experiment Safety Reviewers because no recipients were found.',
          { experimentSafetyPk: experimentSafety.experimentSafetyPk }
        );
        break;
      }

      await sendMail(
        experimentSafetyRecipients,
        async () => {},
        successfulMessage,
        failMessage,
        emailTemplateId,
        loggedInUserId
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
  successfulMessage: string,
  failMessage: string,
  emailTemplateId: string,
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
              template: emailTemplateId,
            },
            substitution_data: {
              experimentSafety: recipientWithData.experimentSafety,
              pi: recipientWithData.pi,
              firstName: recipientWithData.firstName,
              lastName: recipientWithData.lastName,
              preferredName: recipientWithData.preferredName,
            },
            recipients: [{ address: recipientWithData.email }],
          });
          logger.logInfo('Email sent:', {
            result: res,
          });

          const evt = constructExperimentSafetyStatusChangeEvent(
            recipientWithData.experimentSafety,
            loggedInUserId || null,
            `${successfulMessage} template: ${emailTemplateId} to: ${recipientWithData.email} recipient: ${recipientWithData.id}`,
            undefined
          );
          emailEventHandler(evt);
          loggingHandler(evt);

          return res;
        } catch (err) {
          logger.logError('Could not send email', {
            error: err,
          });

          const evt = constructExperimentSafetyStatusChangeEvent(
            recipientWithData.experimentSafety,
            loggedInUserId || null,
            `${failMessage} template: ${emailTemplateId} to: ${recipientWithData.email} recipient: ${recipientWithData.id}`,
            undefined
          );
          emailEventHandler(evt);
          loggingHandler(evt);
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
