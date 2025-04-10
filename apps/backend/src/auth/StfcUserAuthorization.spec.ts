import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FacilityDataSource } from '../datasources/FacilityDataSource';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { dummyUser } from '../datasources/mockups/UserDataSource';
import { Facility } from '../models/Facility';
import { Instrument } from '../models/Instrument';
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

const instrumentDataSource = container.resolve(
  Tokens.InstrumentDataSource
) as InstrumentDataSource;

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

const mockGetRequiredInstrumentForRole = jest.spyOn(
  userAuthorization,
  'getRequiredFacilityForRole'
);

const facilities = [
  new Facility(0, 'ISIS Facility', 'ISIS'),
  new Facility(1, 'LSF Facility', 'LSF'),
];

const isisFacility = facilities[0];
const lsfFacility = facilities[1];
const nonExistingInstrumentName = 'NONEXISTING_INSTRUMENT';

beforeAll(() => {
  jest
    .spyOn(facilityDataSource, 'getFacilitiesByNames')
    .mockImplementation(async (facilityNames: string[]) =>
      facilities.filter((facility) =>
        facilityNames.includes(facility.shortCode)
      )
    );
});

beforeEach(() => {
  mockAssignScientistToFacility.mockClear();
  mockRemoveScientistFromFacility.mockClear();
  mockGetRequiredInstrumentForRole.mockClear();
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

test('When getting instruments for roles, duplicate roles are filtered out before', async () => {
  await userAuthorization.externalTokenLogin('valid', '');

  // Duplicate 'User Officer' and 'ISIS Instrument Scientist' roles removed
  expect(mockGetRequiredInstrumentForRole).toHaveBeenCalledWith([
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

// getInstrumentsToAdd
test('When a user is not already assigned to a requested instrument, the instrument is added', async () => {
  const requiredInstruments = [isisFacility.name];
  const currentInstruments: Instrument[] = [];

  const result = await userAuthorization.getFacilitiesToAdd(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([isisFacility.id]);
});

test('When a user is already assigned to a requested instrument, the instrument is not added', async () => {
  const requiredInstruments = [isisFacility.name];
  const currentInstruments = [isisFacility];

  const result = await userAuthorization.getFacilitiesToAdd(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([]);
});

test('When a user requests a nonexisting instrument, no instrument is added', async () => {
  const requiredInstruments = [nonExistingInstrumentName];
  const currentInstruments: Instrument[] = [];

  const result = await userAuthorization.getFacilitiesToAdd(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([]);
});

test('When a user requests multiple instruments, only new existing ones are added', async () => {
  const requiredInstruments = [
    isisFacility.name,
    lsfFacility.name,
    nonExistingInstrumentName,
  ];
  const currentInstruments: Facility[] = [isisFacility];

  const result = await userAuthorization.getFacilitiesToAdd(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([lsfFacility.id]);
});

// getInstrumentsToRemove
test('When a user has an instrument they have not requested, the instrument is removed', async () => {
  const requiredInstruments: string[] = [];
  const currentInstruments = [isisFacility];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([isisFacility.id]);
});

test('When a user has an instrument they have requested, no instrument is removed', async () => {
  const requiredInstruments = [isisFacility.name];
  const currentInstruments = [isisFacility];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([]);
});

test('When a user does not have an instrument they requested, no instrument is removed', async () => {
  const requiredInstruments = [isisFacility.name];
  const currentInstruments: Instrument[] = [];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([]);
});

test('When a user requests a nonexisting instrument, all other instruments are removed', async () => {
  const requiredInstruments = [nonExistingInstrumentName];
  const currentInstruments = [isisFacility, lsfFacility];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([isisFacility.id, lsfFacility.id]);
});

test('When a user requests multiple instrument, only non requested ones are removed', async () => {
  const requiredInstruments = [isisFacility.name];
  const currentInstruments: Facility[] = [isisFacility, lsfFacility];

  const result = await userAuthorization.getFacilitiesToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([lsfFacility.id]);
});

//autoAssignRemoveInstruments
test('When a user requires an instrument but does not have it, the instrument is assigned and no instrument are removed', async () => {
  await userAuthorization.autoAssignRemoveFacilities(
    0,
    [isisFacility.name],
    [],
    true
  );

  expect(mockAssignScientistToFacility).toHaveBeenCalledWith(0, [
    isisFacility.id,
  ]);
  expect(mockRemoveScientistFromFacility).toHaveBeenCalledTimes(0);
});

test('When a user does not require an instrument but has it, no instrument is assigned and the instrument is removed', async () => {
  await userAuthorization.autoAssignRemoveFacilities(
    0,
    [],
    [isisFacility],
    true
  );

  expect(mockAssignScientistToFacility).toHaveBeenCalledTimes(0);
  expect(mockRemoveScientistFromFacility).toHaveBeenCalledWith(0, [
    isisFacility.id,
  ]);
});

test('When a user requires an instrument but has a different one, the requested instrument is assigned and the current instrument is removed', async () => {
  await userAuthorization.autoAssignRemoveFacilities(
    0,
    [isisFacility.name],
    [lsfFacility],
    true
  );

  expect(mockAssignScientistToFacility).toHaveBeenCalledWith(0, [
    isisFacility.id,
  ]);
  expect(mockRemoveScientistFromFacility).toHaveBeenCalledWith(0, [
    lsfFacility.id,
  ]);
});
