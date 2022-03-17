import { Role, Roles } from '../../models/Role';
import { dummyUser } from '../mockups/UserDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';

jest.mock('./UOWSSoapInterface');
jest.mock('../postgres/UserDataSource.ts');

const userdataSource = new StfcUserDataSource();
const dummyUserNumber = 12345;

beforeAll(() => {
  const mockGetRoles = jest.spyOn(userdataSource, 'getRoles');
  mockGetRoles.mockImplementation(() =>
    Promise.resolve([
      new Role(1, Roles.USER, 'User'),
      new Role(2, Roles.USER_OFFICER, 'User Officer'),
      new Role(3, Roles.INSTRUMENT_SCIENTIST, 'Instrument Scientist'),
    ])
  );
  const mockEnsureDummyUserExists = jest.spyOn(
    userdataSource,
    'ensureDummyUserExists'
  );
  mockEnsureDummyUserExists.mockImplementation((userId: number) => {
    const user = dummyUser;
    user.id = userId;

    return Promise.resolve(user);
  });
});

test('When getting roles for a user, the User role is the first role in the list', async () => {
  const roles = await userdataSource.getUserRoles(dummyUserNumber);

  return expect(roles[0]).toEqual(
    expect.objectContaining(new Role(expect.any(Number), Roles.USER, 'User'))
  );
});

test('When getting roles for a user, STFC roles are translated into ESS roles', async () => {
  return expect(userdataSource.getUserRoles(dummyUserNumber)).resolves.toEqual(
    expect.arrayContaining([
      new Role(1, Roles.USER, 'User'),
      new Role(2, Roles.USER_OFFICER, 'User Officer'),
      new Role(3, Roles.INSTRUMENT_SCIENTIST, 'Instrument Scientist'),
    ])
  );
});

test('When getting roles for a user, no roles are granted if role definitions do not exist', async () => {
  const mockGetRoles = jest.spyOn(userdataSource, 'getRoles');
  mockGetRoles.mockImplementation(() => Promise.resolve([]));

  const roles = await userdataSource.getUserRoles(dummyUserNumber);

  return expect(roles).toHaveLength(0);
});
