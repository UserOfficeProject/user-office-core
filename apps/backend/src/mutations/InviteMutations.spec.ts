import 'reflect-metadata';
import { faker } from '@faker-js/faker';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CoProposerClaimDataSourceMock } from '../datasources/mockups/CoProposerClaimDataSource';
import { InviteDataSourceMock } from '../datasources/mockups/InviteDataSource';
import { RoleClaimDataSourceMock } from '../datasources/mockups/RoleClaimDataSource';
import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
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
});
