import { Role, Roles } from '../../models/Role';
import { dummyUser } from '../mockups/UserDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';
import UOWSSoapClient from './UOWSSoapInterface';

jest.mock('./UOWSSoapInterface');
jest.mock('../postgres/UserDataSource.ts');
jest.mock('../../utils/LRUCache');

describe('Role tests', () => {
  const dummyUserNumber = 12345;

  beforeAll(() => {
    const mockGetRoles = jest.spyOn(StfcUserDataSource.prototype, 'getRoles');
    mockGetRoles.mockImplementation(() =>
      Promise.resolve([
        new Role(1, Roles.USER, 'User'),
        new Role(2, Roles.USER_OFFICER, 'User Officer'),
        new Role(3, Roles.INSTRUMENT_SCIENTIST, 'Instrument Scientist'),
      ])
    );

    const mockEnsureDummyUserExists = jest.spyOn(
      StfcUserDataSource.prototype,
      'ensureDummyUserExists'
    );

    mockEnsureDummyUserExists.mockImplementation((userId: number) => {
      const user = dummyUser;
      user.id = userId;

      return Promise.resolve(user);
    });
  });

  test('When getting roles for a user, the User role is the first role in the list', async () => {
    const userdataSource = new StfcUserDataSource();
    const roles = await userdataSource.getUserRoles(dummyUserNumber);

    return expect(roles[0]).toEqual(
      expect.objectContaining(new Role(expect.any(Number), Roles.USER, 'User'))
    );
  });

  test('When getting roles for a user, STFC roles are translated into ESS roles', async () => {
    const userdataSource = new StfcUserDataSource();

    return expect(
      userdataSource.getUserRoles(dummyUserNumber)
    ).resolves.toEqual(
      expect.arrayContaining([
        new Role(1, Roles.USER, 'User'),
        new Role(2, Roles.USER_OFFICER, 'User Officer'),
        new Role(3, Roles.INSTRUMENT_SCIENTIST, 'Instrument Scientist'),
      ])
    );
  });

  test('When getting roles for a user, no roles are granted if role definitions do not exist', async () => {
    const userdataSource = new StfcUserDataSource();
    const mockGetRoles = jest.spyOn(userdataSource, 'getRoles');
    mockGetRoles.mockImplementation(() => Promise.resolve([]));

    const roles = await userdataSource.getUserRoles(dummyUserNumber);

    return expect(roles).toHaveLength(0);
  });
});

describe('Email search tests', () => {
  const userdataSource = new StfcUserDataSource();

  const uowsClient = UOWSSoapClient.getInstance();

  const mockGetSearchableBasicPersonDetailsFromEmail = jest.spyOn(
    uowsClient,
    'getSearchableBasicPersonDetailsFromEmail'
  );

  const mockGetBasicPersonDetailsFromEmail = jest.spyOn(
    uowsClient,
    'getBasicPersonDetailsFromEmail'
  );

  const mockEnsureDummyUserExists = jest.spyOn(
    userdataSource,
    'ensureDummyUserExists'
  );

  beforeEach(() => {
    mockGetSearchableBasicPersonDetailsFromEmail.mockClear();
    mockGetBasicPersonDetailsFromEmail.mockClear();
    mockEnsureDummyUserExists.mockClear();
  });

  test('When getting basic user details, the basic user is created and returned', async () => {
    const result = await userdataSource.getBasicUserDetailsByEmail('valid');

    expect(mockGetBasicPersonDetailsFromEmail).toHaveBeenCalledTimes(0);
    expect(mockGetSearchableBasicPersonDetailsFromEmail).toHaveBeenCalledTimes(
      1
    );
    expect(mockEnsureDummyUserExists).toHaveBeenCalledTimes(1);

    expect(result).toHaveProperty('id', 12345);
  });

  test('When getting non-basic user details, the non-basic user is created and returned', async () => {
    const result = await userdataSource.getByEmail('valid');

    expect(mockGetBasicPersonDetailsFromEmail).toHaveBeenCalledTimes(1);
    expect(mockGetSearchableBasicPersonDetailsFromEmail).toHaveBeenCalledTimes(
      0
    );
    expect(mockEnsureDummyUserExists).toHaveBeenCalledTimes(1);

    expect(result).toHaveProperty('id', 12345);
  });

  test('When a user is not found by the UOWS, a dummy user is not created', async () => {
    const result = await userdataSource.getByEmail('invalid');

    expect(mockEnsureDummyUserExists).toHaveBeenCalledTimes(0);

    expect(result).toBeNull();
  });

  test('When an invalid token is provided, a dummy user is not created', async () => {
    mockGetBasicPersonDetailsFromEmail.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (Token: any, Email: any) => {
        return Promise.resolve(null);
      }
    );

    const result = await userdataSource.getByEmail('valid');

    expect(mockEnsureDummyUserExists).toHaveBeenCalledTimes(0);

    expect(result).toBeNull();
  });
});
