import 'reflect-metadata';
import {
  CallDataSourceMock,
  dummyCall,
  dummyCalls,
} from '../datasources/mockups/CallDataSource';
import { dummyUserWithRole } from '../datasources/mockups/UserDataSource';
import CallQueries from './CallQueries';

const callMutations = new CallQueries(new CallDataSourceMock());

test('A user can get a call', () => {
  return expect(callMutations.get(dummyUserWithRole, 1)).resolves.toBe(
    dummyCall
  );
});

test('A not logged in user can not get a call', () => {
  return expect(callMutations.get(null, 1)).resolves.toBe(null);
});

test('A user can get all calls', () => {
  return expect(callMutations.getAll(dummyUserWithRole)).resolves.toStrictEqual(
    dummyCalls
  );
});

test('A not logged in user can not get all calls', () => {
  return expect(callMutations.getAll(null)).resolves.toBe(null);
});
