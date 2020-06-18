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

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const callMutations = new CallMutations(
  new CallDataSourceMock(),
  userAuthorization
);

describe('Test Call Mutations', () => {
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
    const callToCreate = {
      shortCode: '2019-02-19',
      startCall: new Date('2019-02-19'),
      endCall: new Date('2019-02-19'),
      startReview: new Date('2019-02-19'),
      endReview: new Date('2019-02-19'),
      startNotify: new Date('2019-02-19'),
      endNotify: new Date('2019-02-19'),
      cycleComment: 'Comment review',
      surveyComment: 'Comment feedback',
    };

    return expect(
      callMutations.create(dummyUserOfficerWithRole, callToCreate)
    ).resolves.toStrictEqual({ id: 1, ...callToCreate, templateId: 1 });
  });

  test('A logged in user can not update a call', () => {
    return expect(
      callMutations.update(dummyUserWithRole, {
        id: 1,
        shortCode: '2020-06-18',
        startCall: new Date('2020-06-18'),
        endCall: new Date('2020-06-18'),
        startReview: new Date('2020-06-18'),
        endReview: new Date('2020-06-18'),
        startNotify: new Date('2020-06-18'),
        endNotify: new Date('2020-06-18'),
        cycleComment: 'Comment review update',
        surveyComment: 'Comment feedback update',
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can update a call', () => {
    const updatedCall = {
      id: 1,
      shortCode: '2020-06-18',
      startCall: new Date('2020-06-18'),
      endCall: new Date('2020-06-18'),
      startReview: new Date('2020-06-18'),
      endReview: new Date('2020-06-18'),
      startNotify: new Date('2020-06-18'),
      endNotify: new Date('2020-06-18'),
      cycleComment: 'Comment review update',
      surveyComment: 'Comment feedback update',
    };

    return expect(
      callMutations.update(dummyUserOfficerWithRole, updatedCall)
    ).resolves.toStrictEqual({ ...dummyCall, ...updatedCall });
  });

  test('A logged in user can not assign instrument to a call', () => {
    return expect(
      callMutations.assignInstrumentToCall(dummyUserWithRole, {
        callId: 1,
        instrumentIds: [1],
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can assign instrument to a call', () => {
    return expect(
      callMutations.assignInstrumentToCall(dummyUserOfficerWithRole, {
        callId: 1,
        instrumentIds: [1],
      })
    ).resolves.toBe(dummyCall);
  });

  test('A logged in user can not remove assigned instrument from a call', () => {
    return expect(
      callMutations.removeAssignedInstrumentFromCall(dummyUserWithRole, {
        callId: 1,
        instrumentId: 1,
      })
    ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
  });

  test('A logged in user officer can remove assigned instrument from a call', () => {
    return expect(
      callMutations.removeAssignedInstrumentFromCall(dummyUserOfficerWithRole, {
        callId: 1,
        instrumentId: 1,
      })
    ).resolves.toBe(dummyCall);
  });
});
