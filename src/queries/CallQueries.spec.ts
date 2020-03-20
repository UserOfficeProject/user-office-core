import 'reflect-metadata';
import {
  CallDataSourceMock,
  dummyCall,
} from '../datasources/mockups/CallDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  UserDataSourceMock,
  dummyUser,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import CallQueries from './CallQueries';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const callMutations = new CallQueries(
  new CallDataSourceMock(),
  userAuthorization
);

test('A user can get a call', () => {
  return expect(callMutations.get(dummyUser, 1)).resolves.toBe(dummyCall);
});

test('A not logged in user can not get a call', () => {
  return expect(callMutations.get(null, 1)).resolves.toBe(null);
});

test('A user can get all calls', () => {
  return expect(callMutations.getAll(dummyUser)).resolves.toStrictEqual([
    dummyCall,
  ]);
});

test('A not logged in user can not get all calls', () => {
  return expect(callMutations.getAll(null)).resolves.toBe(null);
});
