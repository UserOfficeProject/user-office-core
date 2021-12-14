import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyInstitution } from '../datasources/mockups/AdminDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import { Page } from '../models/Admin';
import { Permissions } from '../models/Permissions';
import AdminMutations from './AdminMutations';

const adminMutations = container.resolve(AdminMutations);

describe('Test Admin Mutations', () => {
  test('A user can not set page text', () => {
    return expect(
      adminMutations.setPageText(null, { id: 1, text: 'New page contents' })
    ).resolves.not.toBeInstanceOf(Page);
  });

  test('A user officer can set page text', () => {
    return expect(
      adminMutations.setPageText(dummyUserOfficerWithRole, { id: 1, text: '' })
    ).resolves.toBeInstanceOf(Page);
  });

  test('A user officer can delete a institution', () => {
    return expect(
      adminMutations.deleteInstitutions(dummyUserOfficerWithRole, 1)
    ).resolves.toBe(dummyInstitution);
  });

  test('A user officer can create a institution', () => {
    return expect(
      adminMutations.createInstitutions(
        dummyUserOfficerWithRole,
        dummyInstitution
      )
    ).resolves.toBe(dummyInstitution);
  });

  test('A user officer can update a institution', () => {
    return expect(
      adminMutations.updateInstitutions(
        dummyUserOfficerWithRole,
        dummyInstitution
      )
    ).resolves.toBe(dummyInstitution);
  });

  test('A user can not update a institution', () => {
    return expect(
      adminMutations.updateInstitutions(dummyUserWithRole, {
        id: 1,
        name: 'something',
        country: 1,
        verified: true,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user can not create an api access token', () => {
    return expect(
      adminMutations.createApiAccessToken(dummyUserWithRole, {
        name: 'Test token 1',
        accessPermissions: '{ "UserQueries.get": true }',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user officer can not create an api access token with invalid input', async () => {
    const firstResult = await adminMutations.createApiAccessToken(
      dummyUserOfficerWithRole,
      {
        name: '',
        accessPermissions: '{ "UserQueries.get": true }',
      }
    );

    expect(firstResult).toHaveProperty('reason', 'Input validation errors');

    const secondResult = await adminMutations.createApiAccessToken(
      dummyUserOfficerWithRole,
      {
        name: 'Test token 1',
        accessPermissions: '{ "UserQueries.get" }',
      }
    );

    expect(secondResult).toHaveProperty('reason', 'Input validation errors');
  });

  test('A user officer can create an api access token', async () => {
    const result = await adminMutations.createApiAccessToken(
      dummyUserOfficerWithRole,
      {
        name: 'Test token 1',
        accessPermissions: '{ "UserQueries.get": true }',
      }
    );

    expect(result).toBeInstanceOf(Permissions);
    expect(result).toHaveProperty('name', 'Test token 1');
    expect(result).toHaveProperty('accessPermissions', {
      'UserQueries.get': true,
    });
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('id');
  });

  test('A user can not update an api access token', () => {
    return expect(
      adminMutations.updateApiAccessToken(dummyUserWithRole, {
        accessTokenId: 'kkmgdyzpj26uxubxoyl',
        name: 'Test token 1',
        accessPermissions: '{ "UserQueries.get": true }',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user officer can not update an api access token with invalid input', async () => {
    const firstResult = await adminMutations.updateApiAccessToken(
      dummyUserOfficerWithRole,
      {
        accessTokenId: 'kkmgdyzpj26uxubxoyl',
        name: '',
        accessPermissions: '{ "UserQueries.get": true }',
      }
    );

    expect(firstResult).toHaveProperty('reason', 'Input validation errors');

    const secondResult = await adminMutations.updateApiAccessToken(
      dummyUserOfficerWithRole,
      {
        accessTokenId: 'kkmgdyzpj26uxubxoyl',
        name: 'Test token 1',
        accessPermissions: '{ "": }',
      }
    );

    expect(secondResult).toHaveProperty('reason', 'Input validation errors');
  });

  test('A user officer can update an api access token', async () => {
    const result = await adminMutations.updateApiAccessToken(
      dummyUserOfficerWithRole,
      {
        accessTokenId: 'kkmgdyzpj26uxubxoyl',
        name: 'Test token 1 updated',
        accessPermissions:
          '{ "UserQueries.get": true, "UserQueries.getAll": true }',
      }
    );

    expect(result).toBeInstanceOf(Permissions);
    expect(result).toHaveProperty('name', 'Test token 1 updated');
    expect(result).toHaveProperty('accessPermissions', {
      'UserQueries.get': true,
      'UserQueries.getAll': true,
    });
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('id');
  });

  test('A user can not delete an api access token', () => {
    return expect(
      adminMutations.deleteApiAccessToken(dummyUserWithRole, {
        accessTokenId: 'kkmgdyzpj26uxubxoyl',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A user officer can delete an api access token', async () => {
    return expect(
      adminMutations.deleteApiAccessToken(dummyUserOfficerWithRole, {
        accessTokenId: 'kkmgdyzpj26uxubxoyl',
      })
    ).resolves.toBe(true);
  });
});
