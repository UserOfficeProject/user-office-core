import 'reflect-metadata';
import {
  CallDataSourceMock,
  dummyCall,
} from '../datasources/mockups/CallDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  UserDataSourceMock,
  dummyUserWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import CallMutations from './CallMutations';

const callMutations = new CallMutations(new CallDataSourceMock());

test('A user can not create a call', () => {
  return expect(
    callMutations.create(dummyUserWithRole, {
      shortCode: '2019-02-19',
      startCall: new Date('2019-02-19'),
      endCall: new Date('2019-02-19'),
      startReview: new Date('2019-02-19'),
      endReview: new Date('2019-02-19'),
      startNotify: new Date('2019-02-19'),
      endNotify: new Date('2019-02-19'),
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A not logged in user can not create a call', () => {
  return expect(
    callMutations.create(null, {
      shortCode: '2019-02-19',
      startCall: new Date('2019-02-19'),
      endCall: new Date('2019-02-19'),
      startReview: new Date('2019-02-19'),
      endReview: new Date('2019-02-19'),
      startNotify: new Date('2019-02-19'),
      endNotify: new Date('2019-02-19'),
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('A logged in user officer can create a call', () => {
  return expect(
    callMutations.create(dummyUserOfficerWithRole, {
      shortCode: '2019-02-19',
      startCall: new Date('2019-02-19'),
      endCall: new Date('2019-02-19'),
      startReview: new Date('2019-02-19'),
      endReview: new Date('2019-02-19'),
      startNotify: new Date('2019-02-19'),
      endNotify: new Date('2019-02-19'),
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
    })
  ).resolves.toBe(dummyCall);
});
