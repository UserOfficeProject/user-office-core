import 'reflect-metadata';
import { container } from 'tsyringe';

import { dummyCall, dummyCalls } from '../datasources/mockups/CallDataSource';
import {
  dummyUserWithRole,
  dummyInstrumentScientist,
} from '../datasources/mockups/UserDataSource';
import CallQueries from './CallQueries';

const callQueries = container.resolve(CallQueries);

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
