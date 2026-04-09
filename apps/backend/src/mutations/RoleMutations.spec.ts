import { container, Lifecycle } from 'tsyringe';

import { UserAuthorizationMock } from '../auth/mockups/UserAuthorization';
import { Tokens } from '../config/Tokens';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { isRejection } from '../models/Rejection';
import RoleMutations from './RoleMutations';

let roleMutations: RoleMutations;

beforeEach(() => {
  container.register(
    Tokens.UserAuthorization,
    { useClass: UserAuthorizationMock },
    { lifecycle: Lifecycle.Singleton }
  );
  roleMutations = container.resolve(RoleMutations);
});

describe('Role Mutations', () => {
  test('A normal user cannot create a role', async () => {
    const result = await roleMutations.createRole(dummyUserWithRole, {
      title: 'New Role',
      shortCode: 'new_role',
      description: 'A new role',
      permissions: [],
    });
    expect(isRejection(result)).toBe(true);
    expect(result).toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user officer can create a role', async () => {
    const result = await roleMutations.createRole(dummyUserOfficerWithRole, {
      title: 'New Role',
      shortCode: 'new_role',
      description: 'A new role',
      permissions: [],
    });
    expect(isRejection(result)).toBe(false);
    expect(result).toHaveProperty('title', 'New Role');
    expect(result).toHaveProperty('shortCode', 'new_role');
  });

  test('A normal user cannot update a role', async () => {
    const result = await roleMutations.updateRole(dummyUserWithRole, {
      roleID: 1,
      title: 'Updated Role',
      shortCode: 'updated_role',
      description: 'An updated role',
      permissions: [],
    });
    expect(isRejection(result)).toBe(true);
    expect(result).toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user officer can update a role', async () => {
    const result = await roleMutations.updateRole(dummyUserOfficerWithRole, {
      roleID: 1,
      title: 'Updated Role',
      shortCode: 'updated_role',
      description: 'An updated role',
      permissions: [],
    });
    expect(isRejection(result)).toBe(false);
    expect(result).toHaveProperty('title', 'Updated Role');
  });

  test('A normal user cannot delete a role', async () => {
    const result = await roleMutations.deleteRole(dummyUserWithRole, 1);
    expect(isRejection(result)).toBe(true);
    expect(result).toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user officer can delete a role', async () => {
    const result = await roleMutations.deleteRole(dummyUserOfficerWithRole, 1);
    expect(isRejection(result)).toBe(false);
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('title', 'deleted');
  });
});
