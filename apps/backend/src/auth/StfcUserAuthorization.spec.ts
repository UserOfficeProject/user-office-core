import 'reflect-metadata';
import { container } from 'tsyringe';

import { StfcUserAuthorization } from './StfcUserAuthorization';
import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { dummyUser } from '../datasources/mockups/UserDataSource';
import { Instrument } from '../models/Instrument';

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

const mockAssignScientistToInstruments = jest.spyOn(
  instrumentDataSource,
  'assignScientistToInstruments'
);

const mockGetRequiredInstrumentForRole = jest.spyOn(
  userAuthorization,
  'getRequiredInstrumentForRole'
);

const instruments = [
  new Instrument(0, 'ISIS', '', '', 0),
  new Instrument(1, 'LSF', '', '', 0),
];

const isisInstrument = instruments[0];
const lsfInstrument = instruments[1];
const nonExistingInstrumentName = 'NONEXISTING_INSTRUMENT';

beforeAll(() => {
  jest
    .spyOn(instrumentDataSource, 'getInstrumentsByNames')
    .mockImplementation(async (instrumentNames: string[]) =>
      instruments.filter((instrument) =>
        instrumentNames.includes(instrument.name)
      )
    );
});

beforeEach(() => {
  mockAssignScientistToInstruments.mockClear();
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
  const requiredInstruments = [isisInstrument.name];
  const currentInstruments: Instrument[] = [];

  const result = await userAuthorization.getInstrumentsToAdd(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([isisInstrument.id]);
});

test('When a user is already assigned to a requested instrument, the instrument is not added', async () => {
  const requiredInstruments = [isisInstrument.name];
  const currentInstruments = [isisInstrument];

  const result = await userAuthorization.getInstrumentsToAdd(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([]);
});

test('When a user requests a nonexisting instrument, no instrument is added', async () => {
  const requiredInstruments = [nonExistingInstrumentName];
  const currentInstruments: Instrument[] = [];

  const result = await userAuthorization.getInstrumentsToAdd(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([]);
});

test('When a user requests multiple instruments, only new existing ones are added', async () => {
  const requiredInstruments = [
    isisInstrument.name,
    lsfInstrument.name,
    nonExistingInstrumentName,
  ];
  const currentInstruments: Instrument[] = [isisInstrument];

  const result = await userAuthorization.getInstrumentsToAdd(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([lsfInstrument.id]);
});

//autoAssignRemoveInstruments
test('When a user requires an instrument but does not have it, the instrument is assigned', async () => {
  await userAuthorization.autoAssignInstruments(0, [isisInstrument.name], []);

  expect(mockAssignScientistToInstruments).toHaveBeenCalledWith(0, [
    isisInstrument.id,
  ]);
});

test('When a user requires an instrument but has a different one, the requested instrument is assigned and the current instrument stays the same', async () => {
  await userAuthorization.autoAssignInstruments(
    0,
    [isisInstrument.name],
    [lsfInstrument]
  );

  expect(mockAssignScientistToInstruments).toHaveBeenCalledWith(0, [
    isisInstrument.id,
  ]);
});
