import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import sinon from 'sinon';
import { container } from 'tsyringe';

import checkInviteReminderJob from './checkInviteReminderJob';
import { Tokens } from '../../config/Tokens';
import { EmailTemplateId } from '../../eventHandlers/email/essEmailHandler';
import { Invite } from '../../models/Invite';
import { RoleClaim } from '../../models/RoleClaim';
import { SettingsId } from '../../models/Settings';
import { User, UserRole } from '../../models/User';

const mockUserDataSource = {
  getBasicUserInfo: sinon.stub(),
};
const mockInviteDataSource = {
  getInvites: sinon.stub(),
};
const mockRoleClaimDataSource = {
  findByInviteId: sinon.stub(),
};
const mockMailService = {
  sendMail: sinon.stub(),
};
const mockAdminDataSource = {
  getSetting: sinon.stub(),
};

describe('checkInviteReminderJob', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    mockUserDataSource.getBasicUserInfo.reset();
    mockInviteDataSource.getInvites.reset();
    mockRoleClaimDataSource.findByInviteId.reset();
    mockMailService.sendMail.reset();
    mockAdminDataSource.getSetting.reset();

    container.clearInstances();

    container.register(Tokens.UserDataSource, { useValue: mockUserDataSource });
    container.register(Tokens.InviteDataSource, {
      useValue: mockInviteDataSource,
    });
    container.register(Tokens.RoleClaimDataSource, {
      useValue: mockRoleClaimDataSource,
    });
    container.register(Tokens.MailService, { useValue: mockMailService });
    container.register(Tokens.AdminDataSource, {
      useValue: mockAdminDataSource,
    });

    const now = new Date('2025-05-14T10:00:00.000Z');
    clock = sinon.useFakeTimers(now.getTime());
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  it('should not send reminders if no reminder days are configured (settingsValue is empty)', async () => {
    mockAdminDataSource.getSetting
      .withArgs(SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS)
      .resolves({
        id: SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS,
        settingsValue: '',
        description: '',
      });
    await checkInviteReminderJob.functionToRun();
    expect(mockMailService.sendMail.called).toBe(false);
  });

  it('should not send reminders if reminder days setting is null', async () => {
    mockAdminDataSource.getSetting
      .withArgs(SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS)
      .resolves(null);
    await checkInviteReminderJob.functionToRun();
    expect(mockMailService.sendMail.called).toBe(false);
  });

  it('should not send reminders if reminder days are invalid (e.g., text)', async () => {
    mockAdminDataSource.getSetting
      .withArgs(SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS)
      .resolves({
        id: SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS,
        settingsValue: 'invalid,days',
        description: '',
      });
    await checkInviteReminderJob.functionToRun();
    expect(mockMailService.sendMail.called).toBe(false);
  });

  it('should not send reminders if no invites are found for a configured day', async () => {
    mockAdminDataSource.getSetting
      .withArgs(SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS)
      .resolves({
        id: SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS,
        settingsValue: '7',
        description: '',
      });
    mockInviteDataSource.getInvites.resolves([]);
    await checkInviteReminderJob.functionToRun();
    expect(mockMailService.sendMail.called).toBe(false);
  });

  describe('when invites are found', () => {
    const reminderDay = 7;
    const today = new Date('2025-05-14T00:00:00.000Z');
    const targetCreationDate = new Date(today);
    targetCreationDate.setDate(today.getDate() - reminderDay);

    let mockInvite: Invite;
    let mockInviter: Partial<User>;
    let mockRoleClaim: RoleClaim;

    beforeEach(() => {
      mockInvite = {
        id: faker.number.int(),
        code: faker.string.alphanumeric(10),
        email: faker.internet.email(),
        createdAt: new Date(targetCreationDate),
        createdByUserId: faker.number.int(),
        claimedAt: null,
        claimedByUserId: null,
        isEmailSent: true,
        expiresAt: new Date('2025-12-31T00:00:00.000Z'),
        templateId: EmailTemplateId.PROPOSAL_SUBMITTED,
      };

      mockInviter = {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        institution: faker.company.name(),
      };

      mockRoleClaim = {
        roleClaimId: faker.number.int(),
        inviteId: mockInvite.id,
        roleId: UserRole.USER,
      };

      mockAdminDataSource.getSetting
        .withArgs(SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS)
        .resolves({
          id: SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS,
          settingsValue: reminderDay.toString(),
          description: '',
        });
      mockUserDataSource.getBasicUserInfo
        .withArgs(mockInvite.createdByUserId)
        .resolves(mockInviter as User);
      mockRoleClaimDataSource.findByInviteId
        .withArgs(mockInvite.id)
        .resolves([mockRoleClaim]);
      mockMailService.sendMail.resolves();
    });

    it('should send a reminder and update invite if eligible and reminder not yet sent', async () => {
      mockInviteDataSource.getInvites.resolves([mockInvite]);

      await checkInviteReminderJob.functionToRun();

      const expectedStartDate = new Date(targetCreationDate);
      expectedStartDate.setHours(0, 0, 0, 0);
      const expectedEndDate = new Date(targetCreationDate);
      expectedEndDate.setHours(23, 59, 59, 999);

      expect(mockMailService.sendMail.calledOnce).toBe(true);
    });

    it('should handle multiple reminder days and process invites correctly for each', async () => {
      mockAdminDataSource.getSetting
        .withArgs(SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS)
        .resolves({
          id: SettingsId.INVITE_REMINDERS_SEND_DELAY_DAYS,
          settingsValue: '7,14',
          description: '',
        });

      const invite7Days: Invite = {
        ...mockInvite,
        id: faker.number.int(),
      };
      mockUserDataSource.getBasicUserInfo
        .withArgs(invite7Days.createdByUserId)
        .resolves(mockInviter as User);
      mockRoleClaimDataSource.findByInviteId
        .withArgs(invite7Days.id)
        .resolves([
          { ...mockRoleClaim, inviteId: invite7Days.id, roleId: UserRole.USER },
        ]);

      const creationDate14Days = new Date(today);
      creationDate14Days.setDate(today.getDate() - 14);
      const invite14Days: Invite = {
        ...mockInvite,
        id: faker.number.int(),
        createdAt: new Date(creationDate14Days),
      };
      const inviter14Days = {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        institution: faker.company.name(),
      };
      const roleClaim14Days = {
        roleClaimId: faker.number.int(),
        inviteId: invite14Days.id,
        roleId: UserRole.USER,
      };

      mockUserDataSource.getBasicUserInfo
        .withArgs(invite14Days.createdByUserId)
        .resolves(inviter14Days);
      mockRoleClaimDataSource.findByInviteId
        .withArgs(invite14Days.id)
        .resolves([roleClaim14Days]);

      mockInviteDataSource.getInvites.onFirstCall().resolves([invite7Days]);
      mockInviteDataSource.getInvites.onSecondCall().resolves([invite14Days]);

      await checkInviteReminderJob.functionToRun();

      expect(mockInviteDataSource.getInvites.calledTwice).toBe(true);
      expect(mockMailService.sendMail.calledTwice).toBe(true);
    });
  });
});
