import 'reflect-metadata';
import {
  callDataSource,
  dummyCall,
} from '../datasources/mockups/CallDataSource';
import { reviewDataSource } from '../datasources/mockups/ReviewDataSource';
import {
  userDataSource,
  dummyUser,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import CallQueries from './CallQueries';

const userAuthorization = new UserAuthorization(
  new userDataSource(),
  new reviewDataSource()
);
const callMutations = new CallQueries(new callDataSource(), userAuthorization);

test('A user can get a call', () => {
  return expect(callMutations.get(dummyUser, 1)).resolves.toBe(dummyCall);
});

test("A not logged in user can't get a call", () => {
  return expect(callMutations.get(null, 1)).resolves.toBe(null);
});

test('A user can get all calls', () => {
  return expect(callMutations.getAll(dummyUser)).resolves.toStrictEqual([
    dummyCall,
  ]);
});

test("A not logged in user can't get all calls", () => {
  return expect(callMutations.getAll(null)).resolves.toBe(null);
});
