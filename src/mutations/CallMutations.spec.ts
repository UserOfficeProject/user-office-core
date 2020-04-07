import 'reflect-metadata';
import {
  CallDataSourceMock,
  dummyCall,
} from '../datasources/mockups/CallDataSource';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  UserDataSourceMock,
  dummyUser,
  dummyUserOfficer,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import CallMutations from './CallMutations';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const callMutations = new CallMutations(
  new CallDataSourceMock(),
  userAuthorization
);

test('A user can not create a call', () => {
  return expect(
    callMutations.create(dummyUser, {
      shortCode: '2019-02-19',
      startCall: '2019-02-19',
      endCall: '2019-02-19',
      startReview: '2019-02-19',
      endReview: '2019-02-19',
      startNotify: '2019-02-19',
      endNotify: '2019-02-19',
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
    })
  ).resolves.toHaveProperty('reason', 'NOT_USER_OFFICER');
});

test('A not logged in user can not create a call', () => {
  return expect(
    callMutations.create(null, {
      shortCode: '2019-02-19',
      startCall: '2019-02-19',
      endCall: '2019-02-19',
      startReview: '2019-02-19',
      endReview: '2019-02-19',
      startNotify: '2019-02-19',
      endNotify: '2019-02-19',
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('A logged in user officer can create a call', () => {
  return expect(
    callMutations.create(dummyUserOfficer, {
      shortCode: '2019-02-19',
      startCall: '2019-02-19',
      endCall: '2019-02-19',
      startReview: '2019-02-19',
      endReview: '2019-02-19',
      startNotify: '2019-02-19',
      endNotify: '2019-02-19',
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
    })
  ).resolves.toBe(dummyCall);
});
