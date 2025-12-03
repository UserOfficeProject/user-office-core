import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { AdminDataSource } from '../../datasources/AdminDataSource';
import { InviteDataSource } from '../../datasources/InviteDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { MailService } from '../../eventHandlers/MailService/MailService';
import { SettingsId } from '../../models/Settings';

/*
 * This job finds invites that are a certain number of days old
 * and sends a reminder email to the inviter, if invite has not been accepted yet.
 * The number of days is configured in the settings.
 * The job runs every day at 6:00 AM.
 *
 * NB! this job assumes that is is run once a day. Running it more than once a day
 * will result in sending multiple reminder emails for the same invite, running it
 * less than once a day will result in not sending reminder emails for some invites.
 */

const checkInviteReminder = async () => {
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const inviteDataSource = container.resolve<InviteDataSource>(
    Tokens.InviteDataSource
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

  logger.logInfo('Checking invites for reminder based on configured days', {
    reminderDays: reminderDays.join(', '),
  });

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
      'Fetching invites for specific reminder day and date range',
      {
        reminderDay,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }
    );

    const invites = await inviteDataSource.getInvites({
      isClaimed: false,
      isExpired: false,
      createdAfter: startDate,
      createdBefore: endDate,
    });

    logger.logInfo('Found invites for specified reminder day', {
      count: invites.length,
      reminderDay,
    });

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

      const { templateId } = invite;
      if (!templateId) {
        logger.logError(
          'Invite does not have a template ID, skipping reminder email',
          {
            inviteId: invite.id,
            email: invite.email,
          }
        );
        continue;
      }

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

// NOTE: Run every day at 6:00 AM
const options = { timeToRun: '6 0 * * *' };

const checkInviteReminderJob = {
  functionToRun: checkInviteReminder,
  options,
};

export default checkInviteReminderJob;
