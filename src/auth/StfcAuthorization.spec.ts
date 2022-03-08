import { dummyUser } from '../datasources/mockups/UserDataSource';

const UserAuthorization = newStfcUserAuthorization;
test('When an invalid external token is supplied, no user is found', async () => {
  return expect(userdataSource.externalTokenLogin('invalid')).rejects.toMatch(
    'Failed to fetch user details for STFC external authentication'
  );
});

test('When a valid external token is supplied, valid user is returned', async () => {
  const result = await userdataSource.externalTokenLogin('valid');

  expect(result.id).toBe(1);
  expect(result.email).toBe(dummyUser.email);
});
