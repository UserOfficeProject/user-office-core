import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  UserDataSourceMock,
  dummyUser,
  dummyUserOfficer,
  basicDummyUser,
  basicDummyUserNotOnProposal,
} from '../datasources/mockups/UserDataSource';
import { UserAuthorization } from '../utils/UserAuthorization';
import UserQueries from './UserQueries';

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const userQueries = new UserQueries(
  new UserDataSourceMock(),
  userAuthorization
);

test('A user officer fetch can fetch any user account', () => {
  return expect(userQueries.get(dummyUserOfficer, dummyUser.id)).resolves.toBe(
    dummyUser
  );
});

test('A user is allowed to fetch its own account ', () => {
  return expect(userQueries.me(dummyUser)).resolves.toBe(dummyUser);
});

test('A user is not allowed to fetch other peoples account ', () => {
  return expect(userQueries.get(dummyUser, dummyUserOfficer.id)).resolves.toBe(
    null
  );
});

test('A user officer is allowed to fetch all accounts', () => {
  return expect(
    userQueries.getAll(dummyUserOfficer, '')
  ).resolves.toStrictEqual({
    totalCount: 2,
    users: [basicDummyUser, basicDummyUserNotOnProposal],
  });
});

test('A user is allowed to fetch all accounts', () => {
  return expect(userQueries.getAll(dummyUser, '')).resolves.toStrictEqual({
    totalCount: 2,
    users: [basicDummyUser, basicDummyUserNotOnProposal],
  });
});

test('A user that is not logged in is not allowed to fetch all accounts', () => {
  return expect(userQueries.getAll(null, '')).resolves.toBe(null);
});

test('A user is not allowed to fetch roles', () => {
  return expect(userQueries.getRoles(dummyUser)).resolves.toBe(null);
});
