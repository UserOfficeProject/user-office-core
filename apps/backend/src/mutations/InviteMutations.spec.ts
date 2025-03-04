import 'reflect-metadata';
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

  test('A user on proposal can invite co-proposer', async () => {
    const proposalPk = 1;
    const emails = ['user1@mail.com', 'user2@mail.com'];

    return expect(
      inviteMutations.setCoProposerInvites(dummyUserWithRole, {
        proposalPk,
        emails,
      })
    ).resolves.toHaveLength(2);
  });

  test('A user officer can invite co-proposer', async () => {
    const proposalPk = 1;
    const emails = ['user1@mail.com', 'user2@mail.com'];

    return expect(
      inviteMutations.setCoProposerInvites(dummyUserOfficerWithRole, {
        proposalPk,
        emails,
      })
    ).resolves.toHaveLength(2);
  });

  test('A user not on proposal can not invite co-proposer', async () => {
    const proposalPk = 1;
    const emails = ['user1@mail.com', 'user2@mail.com'];

    return expect(
      inviteMutations.setCoProposerInvites(dummyUserNotOnProposalWithRole, {
        proposalPk,
        emails,
      })
    ).resolves.toHaveProperty(
      'reason',
      'User is not authorized to create invites for this proposal'
    );
  });
});
