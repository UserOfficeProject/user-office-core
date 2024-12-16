import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import InviteMutations from './InviteMutations';

const inviteMutations = container.resolve(InviteMutations);

describe('Test Invite Mutations', () => {
  test('A user officer can create an invite for reviewer', () => {
    const email = 'user@example.com';

    return expect(
      inviteMutations.create(dummyUserOfficerWithRole, {
        email: email,
        note: 'Test note',
        claims: {
          roleIds: [1],
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
          roleIds: [1],
        },
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user can accept valid invite code', () => {
    return expect(
      inviteMutations.accept(dummyUserWithRole, 'code1')
    ).resolves.toBeTruthy();
  });

  test('A user can not accept invalid code', () => {
    return expect(
      inviteMutations.accept(dummyUserWithRole, 'invalid-code')
    ).resolves.toHaveProperty('reason', 'Invite code not found');
  });

  test('A user can not accept code twice', async () => {
    await inviteMutations.accept(dummyUserWithRole, 'code1');

    return expect(
      inviteMutations.accept(dummyUserWithRole, 'code1')
    ).resolves.toHaveProperty('reason', 'Invite code already claimed');
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

  test('A user can not update invite', async () => {
    const updatedEmail = 'updated_email@example.com';

    return expect(
      inviteMutations.update(dummyUserWithRole, {
        id: 1,
        email: updatedEmail,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });
});
