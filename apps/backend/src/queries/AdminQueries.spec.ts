import 'reflect-metadata';
import { container } from 'tsyringe';

import context from '../buildContext';
import AdminQueries from './AdminQueries';
import { Tokens } from '../config/Tokens';
import {
  AdminDataSourceMock,
  dummyApiAccessToken,
  dummyApiAccessTokens,
} from '../datasources/mockups/AdminDataSource';
import {
  derivedDummyUserOfficerWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';

const adminQueries = container.resolve(AdminQueries);

describe('Test Admin Queries', () => {
  beforeEach(() => {
    container.resolve<AdminDataSourceMock>(Tokens.AdminDataSource).init();
  });

  test('A user can get default page text', () => {
    return expect(
      adminQueries.getPageText({ agent: dummyUserWithRole, pageId: 1 })
    ).resolves.toBe('Default Page Notice');
  });

  test('A user can get page text for their role', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserWithRole,
        pageId: 1,
        roleId: 1,
      })
    ).resolves.toBe('Derived Page Notice 1');
  });

  test('A user cannot get page text for another role', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserWithRole,
        pageId: 1,
        roleId: 2,
      })
    ).resolves.toBe(null);
  });

  test('A base user officer can get page text for another role', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserOfficerWithRole,
        pageId: 1,
        roleId: 2,
      })
    ).resolves.toBe('Derived Page Notice 2');
  });

  test('A derived user officer can get page text for a role with a shared tag', () => {
    return expect(
      adminQueries.getPageText({
        agent: derivedDummyUserOfficerWithRole,
        pageId: 1,
        roleId: 1,
      })
    ).resolves.toBe('Derived Page Notice 1');
  });

  test('A derived user officer cannot get page text for a role without a shared tag', () => {
    return expect(
      adminQueries.getPageText({
        agent: derivedDummyUserOfficerWithRole,
        pageId: 1,
        roleId: 2,
      })
    ).resolves.toBe(null);
  });

  test('A user can get features', () => {
    return expect(adminQueries.getFeatures()).resolves.toHaveLength(1);
  });

  test('A user can get settings', async () => {
    const settings = await adminQueries.getSettings();
    expect(settings.length).toBeGreaterThan(0);
  });

  test('A user can not get all api access tokens', () => {
    return expect(
      adminQueries.getAllTokensAndPermissions(dummyUserWithRole)
    ).resolves.toBe(null);
  });

  test('A user-officer can get all api access tokens', () => {
    return expect(
      adminQueries.getAllTokensAndPermissions(dummyUserOfficerWithRole)
    ).resolves.toBe(dummyApiAccessTokens);
  });

  test('A user-officer can get api access token by id', () => {
    return expect(
      adminQueries.getTokenAndPermissionsById(
        dummyUserOfficerWithRole,
        'kkmgdyzpj26uxubxoyl'
      )
    ).resolves.toBe(dummyApiAccessToken);
  });

  test('A user can not get all queries mutations and services', () => {
    return expect(
      adminQueries.getAllQueryMutationAndServicesMethods(
        dummyUserWithRole,
        context
      )
    ).resolves.toEqual(null);
  });

  test('A user-officer can get all queries mutations and services', async () => {
    const result = await adminQueries.getAllQueryMutationAndServicesMethods(
      dummyUserOfficerWithRole,
      context
    );

    const coreQueries = result?.queries.find(
      (queryGroup) => queryGroup.groupName === 'core'
    );
    const coreMutations = result?.mutations.find(
      (mutationGroup) => mutationGroup.groupName === 'core'
    );

    expect(result.queries.length).toBeGreaterThan(0);
    expect(result.mutations.length).toBeGreaterThan(0);
    expect(result.services.length).toBeGreaterThan(0);

    expect(coreQueries?.items?.length).toBeGreaterThan(0);
    expect(coreMutations?.items?.length).toBeGreaterThan(0);

    expect(coreQueries?.items).toContain('ProposalQueries.getAll');
  });
});
