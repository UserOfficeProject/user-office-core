import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyUser } from '../datasources/mockups/UserDataSource';
import { StfcUserAuthorization } from './StfcUserAuthorization';

jest.mock('../datasources/stfc/UOWSSoapInterface.ts');

const userAuthorization = container.resolve(StfcUserAuthorization);

test('When an invalid external token is supplied, no user is found', async () => {
  return expect(
    userAuthorization.externalTokenLogin('invalid')
  ).rejects.toMatch(
    'Failed to fetch user details for STFC external authentication'
  );
});

test('When a valid external token is supplied, valid user is returned', async () => {
  const result = await userAuthorization.externalTokenLogin('valid');

  expect(result?.id).toBe(dummyUser.id);
  expect(result?.email).toBe(dummyUser.email);
});
