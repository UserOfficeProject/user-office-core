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
      .findByInviteId(invite.id);

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
      .findByInviteId(invite.id);

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
      .findByInviteId(invite.id);

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

  test('A user can set CoProposerInvites for their proposal', async () => {
    const email = 'coproposer@example.com';
    const proposalPk = 1;

    const invite = (await inviteMutations.create(dummyUserWithRole, {
      email,
      note: 'Test note',
      claims: {
        coProposerProposalPk: proposalPk,
        roleIds: [UserRole.USER],
      },
    })) as Invite;

    const coProposerClaim = await container
      .resolve<CoProposerClaimDataSourceMock>(Tokens.CoProposerClaimDataSource)
      .findByInviteId(invite.id);

    expect(coProposerClaim).toMatchObject({
      inviteId: invite.id,
      proposalPk,
    });
  });

  test('A user not on a proposal cannot set CoProposerInvites', async () => {
    const email = 'notonproposal@example.com';
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

  test('A user can not create invite for user officer role', async () => {
    const email = 'john@gmail.com';

    const response = await inviteMutations.create(
      dummyUserNotOnProposalWithRole,
      {
        email,
        note: 'Test note',
        claims: {
          roleIds: [UserRole.USER_OFFICER],
        },
      }
    );

    expect(response).toBeInstanceOf(Rejection);
  });
});
