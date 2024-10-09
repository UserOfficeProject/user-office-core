import 'reflect-metadata';
import { container } from 'tsyringe';

import { StfcUserAuthorization } from './StfcUserAuthorization';
import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { dummyUser } from '../datasources/mockups/UserDataSource';
import { Instrument } from '../models/Instrument';

jest.mock('../datasources/stfc/UOWSSoapInterface.ts');
jest.mock('../utils/Cache');

const userAuthorization = container.resolve(StfcUserAuthorization);

const instrumentDataSource = container.resolve(
  Tokens.InstrumentDataSource
) as InstrumentDataSource;

const mockRemoveScientistFromInstruments = jest.spyOn(
  instrumentDataSource,
  'removeScientistFromInstruments'
);

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
  mockRemoveScientistFromInstruments.mockClear();
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

// getInstrumentsToRemove
test('When a user has an instrument they have not requested, the instrument is removed', async () => {
  const requiredInstruments: string[] = [];
  const currentInstruments = [isisInstrument];

  const result = await userAuthorization.getInstrumentsToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([isisInstrument.id]);
});

test('When a user has an instrument they have requested, no instrument is removed', async () => {
  const requiredInstruments = [isisInstrument.name];
  const currentInstruments = [isisInstrument];

  const result = await userAuthorization.getInstrumentsToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([]);
});

test('When a user does not have an instrument they requested, no instrument is removed', async () => {
  const requiredInstruments = [isisInstrument.name];
  const currentInstruments: Instrument[] = [];

  const result = await userAuthorization.getInstrumentsToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([]);
});

test('When a user requests a nonexisting instrument, all other instruments are removed', async () => {
  const requiredInstruments = [nonExistingInstrumentName];
  const currentInstruments = [isisInstrument, lsfInstrument];

  const result = await userAuthorization.getInstrumentsToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([isisInstrument.id, lsfInstrument.id]);
});

test('When a user requests multiple instrument, only non requested ones are removed', async () => {
  const requiredInstruments = [isisInstrument.name];
  const currentInstruments: Instrument[] = [isisInstrument, lsfInstrument];

  const result = await userAuthorization.getInstrumentsToRemove(
    requiredInstruments,
    currentInstruments
  );

  expect(result).toEqual([lsfInstrument.id]);
});

//autoAssignRemoveInstruments
test('When a user requires an instrument but does not have it, the instrument is assigned and no instrument are removed', async () => {
  await userAuthorization.autoAssignRemoveInstruments(
    0,
    [isisInstrument.name],
    [],
    true
  );

  expect(mockAssignScientistToInstruments).toHaveBeenCalledWith(0, [
    isisInstrument.id,
  ]);
  expect(mockRemoveScientistFromInstruments).toHaveBeenCalledTimes(0);
});

test('When a user does not require an instrument but has it, no instrument is assigned and the instrument is removed', async () => {
  await userAuthorization.autoAssignRemoveInstruments(
    0,
    [],
    [isisInstrument],
    true
  );

  expect(mockAssignScientistToInstruments).toHaveBeenCalledTimes(0);
  expect(mockRemoveScientistFromInstruments).toHaveBeenCalledWith(0, [
    isisInstrument.id,
  ]);
});

test('When a user requires an instrument but has a different one, the requested instrument is assigned and the current instrument is removed', async () => {
  await userAuthorization.autoAssignRemoveInstruments(
    0,
    [isisInstrument.name],
    [lsfInstrument],
    true
  );

  expect(mockAssignScientistToInstruments).toHaveBeenCalledWith(0, [
    isisInstrument.id,
  ]);
  expect(mockRemoveScientistFromInstruments).toHaveBeenCalledWith(0, [
    lsfInstrument.id,
  ]);
});
