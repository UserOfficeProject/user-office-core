import 'reflect-metadata';
import { container } from 'tsyringe';

import context from '../buildContext';
import AdminQueries from './AdminQueries';
import { Tokens } from '../config/Tokens';
import {
  AdminDataSourceMock,
  dummyApiAccessToken,
  dummyApiAccessTokens,
  pages,
} from '../datasources/mockups/AdminDataSource';
import {
  dummyUserOfficerWithDerivedRole,
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
      adminQueries.getPageText({
        agent: dummyUserWithRole,
        pageId: 1,
        roleIds: [-1],
      })
    ).resolves.toStrictEqual([pages[0]]);
  });

  test('A user can get page text for their role', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserWithRole,
        pageId: 1,
        roleIds: [1],
      })
    ).resolves.toStrictEqual([pages[1]]);
  });

  test('A user cannot get page text for another role', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserWithRole,
        pageId: 1,
        roleIds: [2],
      })
    ).resolves.toStrictEqual([]);
  });

  test('A base user officer can get page text for another role', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserOfficerWithRole,
        pageId: 1,
        roleIds: [1],
      })
    ).resolves.toStrictEqual([pages[1]]);
  });

  test('A base user officer can get multiple page texts', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserOfficerWithRole,
        pageId: 1,
        roleIds: [-1, 1, 2],
      })
    ).resolves.toStrictEqual(pages);
  });

  test('A derived user officer can get page text for a role with a shared tag', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserOfficerWithDerivedRole,
        pageId: 1,
        roleIds: [1],
      })
    ).resolves.toStrictEqual([pages[1]]);
  });

  test('A derived user officer cannot get page text for a role without a shared tag', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserOfficerWithDerivedRole,
        pageId: 1,
        roleIds: [2],
      })
    ).resolves.toStrictEqual([]);
  });

  test('A derived user officer request for page texts is refused if any role IDs are unauthorised', () => {
    return expect(
      adminQueries.getPageText({
        agent: dummyUserWithRole,
        pageId: 1,
        roleIds: [1, 2],
      })
    ).resolves.toStrictEqual([]);
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
