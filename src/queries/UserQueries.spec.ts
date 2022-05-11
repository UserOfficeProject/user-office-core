import { container } from 'tsyringe';

import {
  basicDummyUser,
  basicDummyUserNotOnProposal,
  dummyUser,
  dummyUserOfficer,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import UserQueries from './UserQueries';

const userQueries = container.resolve(UserQueries);

test('A user officer fetch can fetch any user account', () => {
  return expect(
    userQueries.get(dummyUserOfficerWithRole, dummyUser.id)
  ).resolves.toBe(dummyUser);
});

test('A user is allowed to fetch its own account', () => {
  return expect(userQueries.me(dummyUserWithRole)).resolves.toBe(dummyUser);
});

test('A user is not allowed to fetch other peoples account', () => {
  return expect(
    userQueries.get(dummyUserWithRole, dummyUserOfficer.id)
  ).resolves.toBe(null);
});

test('A user officer is allowed to fetch all accounts', () => {
  return expect(
    userQueries.getAll(dummyUserOfficerWithRole, { filter: '' })
  ).resolves.toStrictEqual({
    totalCount: 2,
    users: [basicDummyUser, basicDummyUserNotOnProposal],
  });
});

test('A user is allowed to fetch all relevant accounts', () => {
  return expect(
    userQueries.getAll(dummyUserWithRole, { filter: '' })
  ).resolves.toStrictEqual({
    totalCount: 2,
    users: [basicDummyUser, basicDummyUserNotOnProposal],
  });
});

test('A user that is not logged in is not allowed to fetch all accounts', () => {
  return expect(userQueries.getAll(null, { filter: '' })).resolves.toBe(null);
});

test('A user is not allowed to fetch roles', () => {
  return expect(userQueries.getRoles(dummyUserWithRole)).resolves.toBe(null);
});
