import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import { EmailTemplateDataSource } from '../../../datasources/EmailTemplateDataSource';
import { InviteDataSource } from '../../../datasources/InviteDataSource';
import { UserDataSource } from '../../../datasources/UserDataSource';
import { ApplicationEvent } from '../../../events/applicationEvents';
import { Event } from '../../../events/event.enum';
import { EventBus } from '../../../events/eventBus';
import { MailService } from '../../MailService/MailService';
import { EmailTemplateId } from '../emailTemplateId';

export async function proposalCoProposerInvitesUpdatedHandler(
  event: ApplicationEvent
) {
  if (event.type != Event.PROPOSAL_CO_PROPOSER_INVITES_UPDATED) return;

  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const mailService = container.resolve<MailService>(Tokens.MailService);
  const eventBus = container.resolve<EventBus<ApplicationEvent>>(
    Tokens.EventBus
  );
  const emailTemplateDataSource = container.resolve<EmailTemplateDataSource>(
    Tokens.EmailTemplateDataSource
  );
  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
  );

  const template = EmailTemplateId.CO_PROPOSER_INVITE;
  const emailTemplate =
    await emailTemplateDataSource.getEmailTemplateByName(template);
  if (!emailTemplate) {
    throw new Error('Email template not found: ' + template);
  }

  for (const invite of event.array) {
    if (invite.isEmailSent) {
      continue;
    }
    const inviter = await userDataSource.getBasicUserInfo(
      invite.createdByUserId
    );

    if (!inviter) {
      logger.logError('No inviter found when trying to send email', {
        inviter,
        event,
      });

      return;
    }

    const options = {
      content: {
        template: emailTemplate.id.toString(),
      },
      substitution_data: {
        sender:
          (inviter.preferredname || inviter.firstname) + ' ' + inviter.lastname,
        redeem_code: invite.code,
        uos_instance: process.env.BASE_URL,
      },
      recipients: [{ address: invite.email }],
    };

    mailService
      .sendMail(options)
      .then(async (res: any) => {
        logger.logInfo('Emails sent on proposal invite:', {
          result: res,
          event,
        });

        await inviteDataSource.update({
          id: invite.id,
          isEmailSent: true,
          templateId: template,
        });

        await eventBus.publish({
          ...event,
          type: Event.PROPOSAL_CO_PROPOSER_INVITE_SENT,
          invite,
        });
      })
      .catch((err: string) => {
        logger.logError('Could not send email(s) on proposal invite:', {
          error: err,
          event,
        });
      });
  }
}
