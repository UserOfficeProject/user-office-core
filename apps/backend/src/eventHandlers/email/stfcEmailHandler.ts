import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { EmailTemplateId } from './emailTemplateId';
import { Tokens } from '../../config/Tokens';
import { EmailTemplateDataSource } from '../../datasources/EmailTemplateDataSource';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import { MailService } from '../MailService/MailService';

export async function stfcEmailHandler(event: ApplicationEvent) {
  //test for null
  if (event.isRejection) {
    return;
  }

  const mailService = container.resolve<MailService>(Tokens.MailService);

  const emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
    Tokens.EmailTemplateDataSource
  );

  switch (event.type) {
    case Event.CALL_CREATED: {
      if (event?.call) {
        if (!(process.env && process.env.FBS_EMAIL)) {
          logger.logError(
            'Could not send email(s) on call creation, environmental variable (FBS_EMAIL) not found',
            {}
          );

          return;
        }

        const notificationEmailAddress = process.env.FBS_EMAIL;
        const eventCallPartial = (({ shortCode, startCall, endCall }) => ({
          shortCode,
          startCall,
          endCall,
        }))(event.call);

        const template = EmailTemplateId.CALL_CREATED_EMAIL;
        const emailTemplate =
          await emailTemplateDataSource.getEmailTemplateByName(template);

        if (!emailTemplate) {
          logger.logError('Email template not found', {
            template,
          });

          return;
        }

        const sendMailOptions = callCreationEmail(
          eventCallPartial,
          emailTemplate.id.toString(),
          notificationEmailAddress
        );

        mailService
          .sendMail(sendMailOptions)
          .then((res: any) => {
            logger.logInfo('Emails sent on call creation:', {
              result: res,
              event,
            });
          })
          .catch((err: string) => {
            logger.logError('Could not send email(s) on call creation:', {
              error: err,
              event,
            });
          });
      }

      return;
    }
  }
}

const callCreationEmail = function createNotificationEmail(
  notificationInput: Record<string, unknown>,
  templateID: string,
  notificationEmailAddress: string
) {
  const sendMailOptions = {
    content: {
      template: templateID,
    },
    substitution_data: {
      ...notificationInput,
    },
    recipients: [
      {
        address: notificationEmailAddress,
      },
    ],
  };

  return sendMailOptions;
};
