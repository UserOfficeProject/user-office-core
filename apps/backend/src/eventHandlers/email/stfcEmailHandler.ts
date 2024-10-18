import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ApplicationEvent } from '../../events/applicationEvents';
import { Event } from '../../events/event.enum';
import EmailSettings from '../MailService/EmailSettings';
import { MailService } from '../MailService/MailService';

export async function stfcEmailHandler(event: ApplicationEvent) {
  //test for null
  if (event.isRejection) {
    return;
  }

  const mailService = container.resolve<MailService>(Tokens.MailService);

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
        const templateID = 'call-created-email';
        const notificationEmailAddress = process.env.FBS_EMAIL;
        const eventCallPartial = (({ shortCode, startCall, endCall }) => ({
          shortCode,
          startCall,
          endCall,
        }))(event.call);
        const emailSettings = callCreationEmail<typeof eventCallPartial>(
          eventCallPartial,
          templateID,
          notificationEmailAddress
        );

        mailService
          .sendMail(emailSettings)
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

const callCreationEmail = function createNotificationEmail<T>(
  notificationInput: T,
  templateID: string,
  notificationEmailAddress: string
): EmailSettings {
  const emailSettings: EmailSettings = {
    content: {
      template_id: templateID,
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

  return emailSettings;
};
