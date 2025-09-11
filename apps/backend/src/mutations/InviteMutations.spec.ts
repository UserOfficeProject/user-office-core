import { faker } from '@faker-js/faker';
import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { EventLogsDataSource } from '../datasources/EventLogsDataSource';
import { InviteDataSource } from '../datasources/InviteDataSource';
import { AdminDataSourceMock } from '../datasources/mockups/AdminDataSource';
import { CoProposerClaimDataSourceMock } from '../datasources/mockups/CoProposerClaimDataSource';
import { InviteDataSourceMock } from '../datasources/mockups/InviteDataSource';
import { RoleClaimDataSourceMock } from '../datasources/mockups/RoleClaimDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';

import { EmailTemplateId } from '../eventHandlers/email/emailTemplateId';

import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';

import { MailService } from '../eventHandlers/MailService/MailService';
import { Event } from '../events/event.enum';
import { Invite } from '../models/Invite';
import { Rejection } from '../models/Rejection';
import InviteMutations from './InviteMutations';

const inviteMutations = container.resolve(InviteMutations);

describe('Test Invite Mutations', () => {
  beforeEach(() => {
    container.resolve<InviteDataSourceMock>(Tokens.InviteDataSource).init();
    container
      .resolve<RoleClaimDataSourceMock>(Tokens.RoleClaimDataSource)
      .init();
    container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .init();
    container.resolve<AdminDataSourceMock>(Tokens.AdminDataSource).init();
    container.resolve<VisitDataSourceMock>(Tokens.VisitDataSource).init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('A user can accept valid invite code', () => {
    return expect(
      inviteMutations.accept(dummyUserWithRole, 'invite-code')
    ).resolves.toBeInstanceOf(Invite);
  });

  test('A user can not accept invalid code', () => {
    return expect(
      inviteMutations.accept(dummyUserWithRole, 'invalid-invite-code')
    ).resolves.toHaveProperty('reason', 'Invite code not found');
  });

  test('A user can not accept code twice', async () => {
    await inviteMutations.accept(dummyUserWithRole, 'invite-code');

    return expect(
      inviteMutations.accept(dummyUserWithRole, 'invite-code')
    ).resolves.toHaveProperty('reason', 'Invite code already claimed');
  });

  test('A user can not accept expired code', async () => {
    return expect(
      inviteMutations.accept(dummyUserWithRole, 'expired-invite-code')
    ).resolves.toHaveProperty('reason', 'Invite code has expired');
  });

  test('A user can create an invite for co-proposer', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );

    const invite = (response as Invite[])[0];

    const coProposerClaims = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .findByInviteId(invite.id);

    expect(coProposerClaims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          inviteId: invite.id,
          proposalPk,
        }),
      ])
    );
  });

  test('A user officer can create an invite with coProposer claims', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserOfficerWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );

    expect(response).not.toBeInstanceOf(Rejection);

    const invite = (response as Invite[])[0];
    const coProposerClaims = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .findByInviteId(invite.id);

    expect(coProposerClaims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          inviteId: invite.id,
          proposalPk,
        }),
      ])
    );
  });

  test('A user on proposal can create an invite with coProposer claims', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );

    expect(response).not.toBeInstanceOf(Rejection);

    const invite = (response as Invite[])[0];

    const coProposerClaims = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .findByInviteId(invite.id);

    expect(coProposerClaims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          inviteId: invite.id,
          proposalPk,
        }),
      ])
    );
  });

  test('A user not on proposal can no create an invite with coProposer claims', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserNotOnProposalWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );

    expect(response).toBeInstanceOf(Rejection);
  });

  test('A user can set CoProposerInvites for their proposal', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );

    const invite = (response as Invite[])[0];

    const coProposerClaims = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .findByInviteId(invite.id);

    expect(coProposerClaims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          inviteId: invite.id,
          proposalPk,
        }),
      ])
    );
  });

  test('A user not on a proposal cannot set CoProposerInvites', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserNotOnProposalWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );

    expect(response).toBeInstanceOf(Rejection);
  });

  test('A co-proposer should receive an invite email when co-proposer invite is created', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    const mailService = container.resolve<MailService>(Tokens.MailService);
    const sendMailSpy = jest.spyOn(mailService, 'sendMail');

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );

    expect(response).not.toBeInstanceOf(Rejection);

    expect(sendMailSpy).toHaveBeenCalledTimes(1);
    expect(sendMailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        recipients: [{ address: email }],
        content: {
          template_id:
            EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_CO_PROPOSER,
        },
      })
    );
  });

  test('A log should be added when co-proposer invite is sent', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    // Get the exact same instance that the logging handler will use
    const eventLogDataSource = container.resolve<EventLogsDataSource>(
      Tokens.EventLogsDataSource
    );
    const setEventInDataSourceSpy = jest.spyOn(eventLogDataSource, 'set');

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );
    expect(response).not.toBeInstanceOf(Rejection);

    expect(setEventInDataSourceSpy).toHaveBeenCalledTimes(1);
    expect(setEventInDataSourceSpy).toHaveBeenCalledWith(
      dummyUserWithRole.id, // changedBy (userId)
      expect.stringMatching(Event.PROPOSAL_CO_PROPOSER_INVITE_EMAIL_SENT), // eventType
      expect.stringContaining(email), // rowData (JSON string containing the email)
      expect.any(String), // changedObjectId (should be the invite ID)
      expect.stringContaining(`Co-proposer invite sent to: ${email}`), // description
      undefined
    );
  });

  test('Invite should have the templateId set', async () => {
    const email = faker.internet.email();
    const proposalPk = 1;

    const response = await inviteMutations.setCoProposerInvites(
      dummyUserWithRole,
      {
        proposalPk,
        emails: [email],
      }
    );

    expect(response).not.toBeInstanceOf(Rejection);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const invite = (await container
      .resolve<InviteDataSource>(Tokens.InviteDataSource)
      .findById((response as Invite[])[0].id)) as Invite;

    expect(invite.templateId).toBe(
      EmailTemplateId.USER_OFFICE_REGISTRATION_INVITATION_CO_PROPOSER
    );
  });
});
