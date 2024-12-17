import { Role, Roles } from '../../models/Role';
import { dummyUser } from '../mockups/UserDataSource';
import { StfcUserDataSource } from './StfcUserDataSource';

jest.mock('../postgres/UserDataSource.ts');
jest.mock('../../utils/Cache');
jest.mock('./UOWSClient.ts', () => {
  return {
    createUOWSClient: jest.fn().mockReturnValue({
      basicPersonDetails: {
        getBasicPersonDetails: jest
          .fn()
          .mockImplementation((fedid, surname, email, usernumber) => {
            if (email == 'valid') {
              return Promise.resolve([
                {
                  userNumber: '12345',
                  country: 'fake',
                  deptName: 'fake',
                  displayName: 'fake',
                  email: 'valid',
                  establishmentId: 'fake',
                  familyName: 'fake',
                  firstNameKnownAs: 'fake',
                  fullName: 'fake',
                  givenName: 'fake',
                  initials: 'fake',
                  orgName: 'fake',
                  orgId: 'fake',
                  title: 'fake',
                  workPhone: 'fake',
                },
              ]);
            }
            if (usernumber == 1) {
              return Promise.resolve([
                {
                  userNumber: '1',
                  country: 'fake',
                  deptName: 'fake',
                  displayName: 'fake',
                  email: 'valid',
                  establishmentId: 'fake',
                  familyName: 'fake',
                  firstNameKnownAs: 'fake',
                  fullName: 'fake',
                  givenName: 'fake',
                  initials: 'fake',
                  orgName: 'fake',
                  orgId: 'fake',
                  title: 'fake',
                  workPhone: 'fake',
                },
              ]);
            } else {
              return Promise.resolve([]);
            }
          }),
        getSearchableBasicPersonDetails: jest
          .fn()
          .mockImplementation((surname, email, usernumber) => {
            if (email == 'valid') {
              return Promise.resolve([
                {
                  userNumber: '12345',
                  country: 'fake',
                  deptName: 'fake',
                  displayName: 'fake',
                  email: 'valid',
                  establishmentId: 'fake',
                  familyName: 'fake',
                  firstNameKnownAs: 'fake',
                  fullName: 'fake',
                  givenName: 'fake',
                  initials: 'fake',
                  orgName: 'fake',
                  orgId: 'fake',
                  title: 'fake',
                  workPhone: 'fake',
                },
              ]);
            }
            if (usernumber == 1) {
              return Promise.resolve([
                {
                  userNumber: '1',
                  country: 'fake',
                  deptName: 'fake',
                  displayName: 'fake',
                  email: 'userNumCheck',
                  establishmentId: 'fake',
                  familyName: 'fake',
                  firstNameKnownAs: 'fake',
                  fullName: 'fake',
                  givenName: 'fake',
                  initials: 'fake',
                  orgName: 'fake',
                  orgId: 'fake',
                  title: 'fake',
                  workPhone: 'fake',
                },
              ]);
            } else {
              return Promise.resolve([]);
            }
          }),
      },
      role: {
        getRolesForUser: jest.fn().mockResolvedValue([
          {
            name: 'ISIS Instrument Scientist',
          },
          {
            name: 'ISIS Administrator',
          },
          {
            name: 'Developer',
          },
          {
            name: 'Admin',
          },
          {
            name: 'ISIS Instrument Scientist',
          },
          {
            name: 'User Officer',
          },
          {
            name: 'User Officer',
          },
          {
            name: 'User',
          },
        ]),
      },
    }),
  };
});

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

  const mockedClient = require('./UOWSClient').createUOWSClient();

  const mockGetSearchableBasicPersonDetailsFromEmail = jest.spyOn(
    mockedClient.basicPersonDetails,
    'getSearchableBasicPersonDetails'
  );

  const mockGetBasicPersonDetailsFromEmail = jest.spyOn(
    mockedClient.basicPersonDetails,
    'getBasicPersonDetails'
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
    console.log(result);

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
});

describe('Searchable user tests', () => {
  const userDataSource = new StfcUserDataSource();
  const mockedClient = require('./UOWSClient').createUOWSClient();

  const mockGetSearchableBasicPeople = jest.spyOn(
    mockedClient.basicPersonDetails,
    'getSearchableBasicPersonDetails'
  );

  beforeEach(() => {
    mockGetSearchableBasicPeople.mockClear();
  });

  test('When checking whether a searchable user is searchable, the check returns true', async () => {
    const searchableUser = 1;

    const result = await userDataSource.isSearchableUser(searchableUser);

    expect(mockGetSearchableBasicPeople).toHaveBeenCalledTimes(1);
    expect(mockGetSearchableBasicPeople).toHaveBeenCalledWith(
      undefined,
      undefined,
      [String(searchableUser)]
    );
    expect(result).toBe(true);
  });

  test('When checking whether a non-searchable user is searchable, the check returns false', async () => {
    const nonSearchableUser = 2;

    const result = await userDataSource.isSearchableUser(nonSearchableUser);

    expect(mockGetSearchableBasicPeople).toHaveBeenCalledTimes(1);
    expect(mockGetSearchableBasicPeople).toHaveBeenCalledWith(
      undefined,
      undefined,
      [String(nonSearchableUser)]
    );
    expect(result).toBe(false);
  });
});
