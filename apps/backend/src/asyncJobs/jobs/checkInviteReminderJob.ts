import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { RoleClaimDataSource } from '../../datasources/RoleClaimDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { getTemplateIdForRole } from '../../eventHandlers/email/essEmailHandler';
import { MailService } from '../../eventHandlers/MailService/MailService';
import { UserOfficeAsyncJob } from '../startAsyncJobs';

/**
 * This job checks invite reminder needs to be sent for invites that are not yet accepted.
 * It will check if the invite is not accepted and if the current date is greater than
 * the invite reminder date. If so, it will send the invite reminder.
 * It will also update the invite to mark is_reminder_email_sent to true.
 */
const checkInviteReminder = async () => {
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
  );
  const roleClaimDataSource = container.resolve<RoleClaimDataSource>(
    Tokens.RoleClaimDataSource
  );
  const mailService = container.resolve<MailService>(Tokens.MailService);

  const EMAIL_ACCEPT_GRACE_PERIOD_DAYS = 7;
  const createdBefore = new Date();
  createdBefore.setDate(
    createdBefore.getDate() - EMAIL_ACCEPT_GRACE_PERIOD_DAYS
  );

  const invites = await inviteDataSource.getInvites({
    isClaimed: false,
    isReminderEmailSent: false,
    createdBefore: createdBefore,
  });

  for (const invite of invites) {
    const inviter = await userDataSource.getBasicUserInfo(
      invite.createdByUserId
    );

    if (!inviter) {
      logger.logError('No inviter found when trying to send remind email', {
        inviter,
      });

      return;
    }

    const roleInviteClaim = await roleClaimDataSource.findByInviteId(invite.id);

    const templateId = getTemplateIdForRole(roleInviteClaim[0].roleId);

    mailService
      .sendMail({
        content: {
          template_id: templateId,
        },
        substitution_data: {
          email: invite.email,
          inviterName: inviter.firstname,
          inviterLastname: inviter.lastname,
          inviterOrg: inviter.institution,
          redeemCode: invite.code,
        },
        recipients: [{ address: invite.email }],
      })
      .then(async (res) => {
        await inviteDataSource.update({
          id: invite.id,
          isReminderEmailSent: true,
        });
        logger.logInfo('Successful reminder email transmission', { res });
      })
      .catch((err: string) => {
        logger.logException('Failed reminder email transmission', err);
      });
  }
};

// NOTE: Run every day at 6:00 AM
const options = { timeToRun: '6 0 * * *' };

const checkInviteReminderJob: UserOfficeAsyncJob = {
  functionToRun: checkInviteReminder,
  options,
};

export default checkInviteReminderJob;
