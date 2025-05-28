import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FacilityDataSource } from '../datasources/FacilityDataSource';
import { dummyUser } from '../datasources/mockups/UserDataSource';
import { Facility } from '../models/Facility';
import { StfcUserAuthorization } from './StfcUserAuthorization';

jest.mock('../utils/Cache');
jest.mock('../datasources/stfc/UOWSClient.ts', () => {
  return {
    createUOWSClient: jest.fn().mockReturnValue({
      sessions: {
        getLoginBySessionId: jest.fn().mockImplementation((sessionId) => {
          if (sessionId == 'valid') {
            return Promise.resolve([
              {
                userId: 1,
                sessionId: 'fake',
              },
            ]);
          } else {
            return Promise.reject(
              new Error(
                'Failed to fetch user details for STFC external authentication'
              )
            );
          }
        }),
      },
      basicPersonDetails: {
        getBasicPersonDetails: jest
          .fn()
          .mockImplementation((fedid, surname, email, usernumber) => {
            if (usernumber) {
              return Promise.resolve([
                {
                  userNumber: 1,
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

const userAuthorization = container.resolve(StfcUserAuthorization);

const facilityDataSource = container.resolve(
  Tokens.FacilityDataSource
) as FacilityDataSource;

const mockRemoveScientistFromFacility = jest.spyOn(
  facilityDataSource,
  'removeUserFromFacility'
);

const mockAssignScientistToFacility = jest.spyOn(
  facilityDataSource,
  'addUsersToFacility'
);

const mockGetRequiredFacilityForRole = jest.spyOn(
  userAuthorization,
  'getRequiredFacilityForRole'
);

const facilities = [
  new Facility(0, 'ISIS Facility', 'ISIS'),
  new Facility(1, 'LSF Facility', 'LSF'),
];

const isisFacility = facilities[0];
const lsfFacility = facilities[1];
const nonExistingFacilityName = 'NONEXISTING_INSTRUMENT';

beforeAll(() => {
  jest
    .spyOn(facilityDataSource, 'getFacilitiesByNames')
    .mockImplementation(async (facilityNames: string[]) =>
      facilities.filter((facility) => facilityNames.includes(facility.name))
    );
});

beforeEach(() => {
  mockAssignScientistToFacility.mockClear();
  mockRemoveScientistFromFacility.mockClear();
  mockGetRequiredFacilityForRole.mockClear();
});

test('When an invalid external token is supplied, no user is found', async () => {
  return expect(
    userAuthorization.externalTokenLogin('invalid', '')
  ).rejects.toThrow(
    'Failed to fetch user details for STFC external authentication'
  );
});

test('When a valid external token is supplied, valid user is returned', async () => {
  const result = await userAuthorization.externalTokenLogin('valid', '');

  expect(result?.id).toBe(dummyUser.id);
  expect(result?.email).toBe(dummyUser.email);
});

test('When getting facilities for roles, duplicate roles are filtered out before', async () => {
  await userAuthorization.externalTokenLogin('valid', '');

  // Duplicate 'User Officer' and 'ISIS Facility Scientist' roles removed
  expect(mockGetRequiredFacilityForRole).toHaveBeenCalledWith([
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
      name: 'User Officer',
    },
    {
      name: 'User',
    },
  ]);
});

// getFacilitiesToAdd
test('When a user is not already assigned to a requested facility, the facility is added', async () => {
  const requiredFacilities = [isisFacility.name];
  const currentFacilities: Facility[] = [];

  const result = await userAuthorization.getFacilitiesToAdd(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([isisFacility.id]);
});

test('When a user is already assigned to a requested facility, the facility is not added', async () => {
  const requiredFacilities = [isisFacility.name];
  const currentFacilities = [isisFacility];

  const result = await userAuthorization.getFacilitiesToAdd(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([]);
});

test('When a user requests a nonexisting facility, no facility is added', async () => {
  const requiredFacilities = [nonExistingFacilityName];
  const currentFacilities: Facility[] = [];

  const result = await userAuthorization.getFacilitiesToAdd(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([]);
});

test('When a user requests multiple facilities, only new existing ones are added', async () => {
  const requiredFacilities = [
    isisFacility.name,
    lsfFacility.name,
    nonExistingFacilityName,
  ];
  const currentFacilities: Facility[] = [isisFacility];

  const result = await userAuthorization.getFacilitiesToAdd(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([lsfFacility.id]);
});

// getFacilitiesToRemove
test('When a user has an facility they have not requested, the facility is removed', async () => {
  const requiredFacilities: string[] = [];
  const currentFacilities = [isisFacility];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([isisFacility.id]);
});

test('When a user has an facility they have requested, no facility is removed', async () => {
  const requiredFacilities = [isisFacility.name];
  const currentFacilities = [isisFacility];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([]);
});

test('When a user does not have an facility they requested, no facility is removed', async () => {
  const requiredFacilities = [isisFacility.name];
  const currentFacilities: Facility[] = [];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([]);
});

test('When a user requests a nonexisting facility, all other facilities are removed', async () => {
  const requiredFacilities = [nonExistingFacilityName];
  const currentFacilities = [isisFacility, lsfFacility];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([isisFacility.id, lsfFacility.id]);
});

test('When a user requests multiple facility, only non requested ones are removed', async () => {
  const requiredFacilities = [isisFacility.name];
  const currentFacilities: Facility[] = [isisFacility, lsfFacility];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredFacilities,
    currentFacilities
  );

  expect(result).toEqual([lsfFacility.id]);
});

//autoAssignRemoveFacilities
test('When a user requires an facility but does not have it, the facility is assigned and no facility are removed', async () => {
  await userAuthorization.autoAssignRemoveFacilities(
    0,
    [isisFacility.name],
    [],
    true
  );

  expect(mockAssignScientistToFacility).toHaveBeenCalledWith([0], 0);
  expect(mockRemoveScientistFromFacility).toHaveBeenCalledTimes(0);
});

test('When a user does not require an facility but has it, no facility is assigned and the facility is removed', async () => {
  await userAuthorization.autoAssignRemoveFacilities(
    0,
    [],
    [isisFacility],
    true
  );

  expect(mockAssignScientistToFacility).toHaveBeenCalledTimes(0);
  expect(mockRemoveScientistFromFacility).toHaveBeenCalledWith(
    0,
    isisFacility.id
  );
});

test('When a user requires an facility but has a different one, the requested facility is assigned and the current facility is removed', async () => {
  await userAuthorization.autoAssignRemoveFacilities(
    0,
    [isisFacility.name],
    [lsfFacility],
    true
  );

  expect(mockAssignScientistToFacility).toHaveBeenCalledWith(
    [0],
    isisFacility.id
  );
  expect(mockRemoveScientistFromFacility).toHaveBeenCalledWith(
    0,
    lsfFacility.id
  );
});
