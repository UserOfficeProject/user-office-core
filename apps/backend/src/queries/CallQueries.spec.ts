import 'reflect-metadata';
import { container } from 'tsyringe';

import CallQueries from './CallQueries';
import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { dummyCall, dummyCalls } from '../datasources/mockups/CallDataSource';
import {
  dummyUserWithRole,
  dummyInstrumentScientist,
  dummyUserOfficerWithDerivedRole,
} from '../datasources/mockups/UserDataSource';
import { RoleDataSource } from '../datasources/RoleDataSource';

const callQueries = container.resolve(CallQueries);
const callDataSource = container.resolve<CallDataSource>(Tokens.CallDataSource);
const roleDataSource = container.resolve<RoleDataSource>(Tokens.RoleDataSource);

afterEach(() => {
  jest.restoreAllMocks();
});

test('A user can get a call', () => {
  return expect(callQueries.get(dummyUserWithRole, 1)).resolves.toBe(dummyCall);
});

test('A not logged in user can not get a call', () => {
  return expect(callQueries.get(null, 1)).resolves.toBe(null);
});

test('A user can get all calls', () => {
  return expect(callQueries.getAll(dummyUserWithRole)).resolves.toStrictEqual(
    dummyCalls
  );
});

test('A not logged in user can not get all calls', () => {
  return expect(callQueries.getAll(null)).resolves.toBe(null);
});

test('A derived role gets calls filtered by its tags', async () => {
  jest
    .spyOn(roleDataSource, 'getTagsByRoleId')
    .mockResolvedValue([{ id: 1, name: 'Tag1', shortCode: 'T1' }]);
  const getCalls = jest.spyOn(callDataSource, 'getCalls');

  await callQueries.getAll(dummyUserOfficerWithDerivedRole);

  expect(getCalls).toHaveBeenCalledWith(undefined, undefined, undefined, [1]);
});

test('A instrument scientists can get calls assigned to their instruments', () => {
  return expect(
    callQueries.getCallsByInstrumentScientist(
      dummyInstrumentScientist,
      dummyInstrumentScientist.id
    )
  ).resolves.toStrictEqual(dummyCalls);
});

test('A instrument scientists can not get other scientists calls', () => {
  return expect(
    callQueries.getCallsByInstrumentScientist(dummyInstrumentScientist, 123)
  ).resolves.toBe(null);
});

test('A user can not get instrument scientist calls', () => {
  return expect(
    callQueries.getCallsByInstrumentScientist(dummyUserWithRole, 1)
  ).resolves.toBe(null);
});
