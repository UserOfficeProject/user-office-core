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
import { Rejection } from '../models/Rejection';
import { UserRole } from '../models/User';
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

  test('A user officer can create an invite for reviewer', () => {
    const email = 'user@example.com';

    return expect(
      inviteMutations.create(dummyUserOfficerWithRole, {
        email: email,
        note: 'Test note',
        claims: {
          roleIds: [UserRole.FAP_REVIEWER],
        },
      })
    ).resolves.toHaveProperty('email', email);
  });

  test('A user can not create an invite for reviewer', () => {
    return expect(
      inviteMutations.create(dummyUserWithRole, {
        email: 'user@example.com',
        note: 'Test note',
        claims: {
          roleIds: [UserRole.FAP_REVIEWER],
        },
      })
    ).resolves.toBeInstanceOf(Rejection);
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

  test('A user officer can update invite', async () => {
    const updatedEmail = 'updated_email@example.com';

    return expect(
      inviteMutations.update(dummyUserOfficerWithRole, {
        id: 1,
        email: updatedEmail,
      })
    ).resolves.toHaveProperty('email', updatedEmail);
  });

  test('A user officer can add roles to invite', async () => {
    const roleIds = [1, 2, 3];

    await inviteMutations.update(dummyUserOfficerWithRole, {
      id: 1,
      claims: { roleIds },
    });

    const roleClaim = await container
      .resolve<RoleClaimDataSourceMock>(Tokens.RoleClaimDataSource)
      .findByInviteId(1);

    expect(roleClaim).toBeDefined();
    expect(roleClaim.map((roleClaim) => roleClaim.roleId)).toEqual(roleIds);
    expect(roleClaim).toBeDefined();
    expect(roleClaim.map((roleClaim) => roleClaim.roleId)).toEqual(roleIds);
  });

  test('A user can not update invite', async () => {
    const updatedEmail = 'updated_email@example.com';

    return expect(
      inviteMutations.update(dummyUserWithRole, {
        id: 1,
        email: updatedEmail,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user can create an invite for co-proposer', async () => {
    const email = 'test@example.com';
    const proposalPk = 1;

    const invite = (await inviteMutations.create(dummyUserWithRole, {
      email,
      note: 'Test note',
      claims: {
        roleIds: [1],
        coProposerProposalPk: proposalPk,
      },
    })) as Invite;

    const coProposerClaim = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .getByInviteId(invite.id);

    expect(coProposerClaim).toMatchObject({
      inviteId: invite.id,
      proposalPk,
    });
  });

  test('A user officer can create an invite with coProposer claims', async () => {
    const email = 'coproposer_claims@example.com';
    const proposalPk = 1;

    const response = await inviteMutations.create(dummyUserOfficerWithRole, {
      email,
      note: 'Test note',
      claims: {
        coProposerProposalPk: proposalPk,
      },
    });

    expect(response).not.toBeInstanceOf(Rejection);

    const invite = response as Invite;
    const coProposerClaim = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .getByInviteId(invite.id);

    expect(coProposerClaim).toMatchObject({
      inviteId: invite.id,
      proposalPk,
    });
  });

  test('A user on proposal can create an invite with coProposer claims', async () => {
    const email = 'john@gmail.com';
    const proposalPk = 1;

    const response = await inviteMutations.create(dummyUserWithRole, {
      email,
      note: 'Test note',
      claims: {
        coProposerProposalPk: proposalPk,
      },
    });

    expect(response).not.toBeInstanceOf(Rejection);

    const invite = response as Invite;

    const coProposerClaim = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .getByInviteId(invite.id);

    expect(coProposerClaim).toMatchObject({
      inviteId: invite.id,
      proposalPk,
    });
  });

  test('A user not on proposal can no create an invite with coProposer claims', async () => {
    const email = 'john@gmail.com';
    const proposalPk = 1;

    const response = await inviteMutations.create(
      dummyUserNotOnProposalWithRole,
      {
        email,
        note: 'Test note',
        claims: {
          coProposerProposalPk: proposalPk,
        },
      }
    );

    expect(response).toBeInstanceOf(Rejection);
  });

  test('A user officer can update invite with role claims', async () => {
    const roleIds = [1, 2, 3];

    await inviteMutations.update(dummyUserOfficerWithRole, {
      id: 1,
      claims: { roleIds },
    });

    const roleClaim = await container
      .resolve<RoleClaimDataSourceMock>(Tokens.RoleClaimDataSource)
      .findByInviteId(1);

    expect(roleClaim).toBeDefined();
    expect(roleClaim.map((roleClaim) => roleClaim.roleId)).toEqual(roleIds);
    expect(roleClaim).toBeDefined();
    expect(roleClaim.map((roleClaim) => roleClaim.roleId)).toEqual(roleIds);
  });

  test('A user can not update invite with role claims if role is User.USER_OFFICER', async () => {
    const roleIds = [UserRole.USER_OFFICER];

    return expect(
      inviteMutations.update(dummyUserWithRole, {
        id: 1,
        claims: { roleIds },
      })
    ).resolves.toBeInstanceOf(Rejection);
  });

  test('A user officer can update invite with coProposer claims', async () => {
    const proposalPk = 1;

    await inviteMutations.update(dummyUserOfficerWithRole, {
      id: 1,
      claims: { coProposerProposalPk: proposalPk },
    });

    const coProposerClaim = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .getByInviteId(1);

    expect(coProposerClaim).toMatchObject({ inviteId: 1, proposalPk });
  });

  test('A user officer can update invite and set coProposerClaim', async () => {
    const proposalPk = 2;

    await inviteMutations.update(dummyUserOfficerWithRole, {
      id: 2,
      claims: { coProposerProposalPk: proposalPk },
    });

    const coProposerClaim = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .getByInviteId(2);

    expect(coProposerClaim).toMatchObject({ inviteId: 2, proposalPk });
  });

  test('A user can set CoProposerInvites for their proposal', async () => {
    const email = 'coproposer@example.com';
    const proposalPk = 3;

    const invite = (await inviteMutations.create(dummyUserWithRole, {
      email,
      note: 'Test note',
      claims: {
        coProposerProposalPk: proposalPk,
      },
    })) as Invite;

    const coProposerClaim = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .getByInviteId(invite.id);

    expect(coProposerClaim).toMatchObject({
      inviteId: invite.id,
      proposalPk,
    });
  });

  test('A user not on a proposal cannot set CoProposerInvites', async () => {
    const email = 'notonproposal@example.com';
    const proposalPk = 3;

    const response = await inviteMutations.create(
      dummyUserNotOnProposalWithRole,
      {
        email,
        note: 'Test note',
        claims: {
          coProposerProposalPk: proposalPk,
        },
      }
    );

    expect(response).toBeInstanceOf(Rejection);
  });
});
