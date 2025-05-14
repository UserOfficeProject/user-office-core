import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { AdminDataSource } from '../../datasources/AdminDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { RoleClaimDataSource } from '../../datasources/RoleClaimDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { getTemplateIdForRole } from '../../eventHandlers/email/essEmailHandler';
import { MailService } from '../../eventHandlers/MailService/MailService';
import { SettingsId } from '../../models/Settings';

/*
 * This job checks for invites that are older than a certain number of days
 * and sends a reminder email to the inviter.
 * The number of days is configured in the settings.
 * The job runs every day at 6:00 AM.
 *
 * NB! this job assumes that is is run once a day. Running it more than once a day
 * will result in sending multiple reminder emails for the same invite.
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
  const settingsDataSource = container.resolve<AdminDataSource>(
    Tokens.AdminDataSource
  );

  const reminderDelaysSetting = await settingsDataSource.getSetting(
    SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS
  );

  if (!reminderDelaysSetting?.settingsValue) {
    logger.logInfo(
      'No reminder days configured, skipping invite reminders',
      {}
    );

    return;
  }

  const reminderDays = reminderDelaysSetting.settingsValue
    .split(',')
    .map((day) => parseInt(day.trim(), 10))
    .filter((day) => !isNaN(day));

  if (reminderDays.length === 0) {
    logger.logInfo(
      'No valid reminder days configured, skipping invite reminders',
      {}
    );

    return;
  }

  logger.logInfo(
    `Checking invites for reminders at days: ${reminderDays.join(', ')}`,
    {}
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const reminderDay of reminderDays) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - reminderDay);

    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    logger.logInfo(
      `Fetching invites created on day ${reminderDay} (${startDate.toISOString()})`,
      {}
    );

    const invites = await inviteDataSource.getInvites({
      isClaimed: false,
      isExpired: false,
      createdAfter: startDate,
      createdBefore: endDate,
    });

    logger.logInfo(
      `Found ${invites.length} invites for day ${reminderDay}`,
      {}
    );

    for (const invite of invites) {
      const inviter = await userDataSource.getBasicUserInfo(
        invite.createdByUserId
      );

      if (!inviter) {
        logger.logError('No inviter found when trying to send reminder email', {
          inviteId: invite.id,
          createdByUserId: invite.createdByUserId,
        });
        continue;
      }

      const roleInviteClaims = await roleClaimDataSource.findByInviteId(
        invite.id
      );

      if (!roleInviteClaims.length) {
        logger.logError('No role claims found for invite', {
          inviteId: invite.id,
        });
        continue;
      }

      const templateId = getTemplateIdForRole(roleInviteClaims[0].roleId);

      try {
        await mailService.sendMail({
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
        });

        logger.logInfo('Sent invite reminder email', {
          inviteId: invite.id,
          email: invite.email,
          reminderDay,
        });
      } catch (err) {
        logger.logException('Failed to send invite reminder email', err);
      }
    }
  }
};

setTimeout(() => {
  checkInviteReminder();
}, 5000);
// NOTE: Run every day at 6:00 AM
const options = { timeToRun: '6 0 * * *' };

const checkInviteReminderJob = {
  functionToRun: checkInviteReminder,
  options,
};

export default checkInviteReminderJob;
