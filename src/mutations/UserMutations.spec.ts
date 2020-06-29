import jsonwebtoken from 'jsonwebtoken';

import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  dummyPlaceHolderUser,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer,
  UserDataSourceMock,
  dummyUserWithRole,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';

import UserMutations from './UserMutations';
import { EmailInviteResponse } from '../models/EmailInviteResponse';
import { BasicUserDetails, UserRole } from '../models/User';
import { isRejection } from '../rejection';
import { UserAuthorization } from '../utils/UserAuthorization';

const secret = process.env.secret as string;

const goodToken = jsonwebtoken.sign(
  {
    user: { id: dummyUser.id },
    type: 'passwordReset',
    updated: dummyUser.updated,
  },
  secret,
  { expiresIn: '24h' }
);

const badToken = jsonwebtoken.sign(
  {
    id: dummyUser.id,
    updated: dummyUser.updated,
  },
  secret,
  { expiresIn: '-24h' }
);

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const userMutations = new UserMutations(
  new UserDataSourceMock(),
  userAuthorization
);

test('A user can invite another user by email', () => {
  const emailInviteResponse = new EmailInviteResponse(
    5,
    dummyUser.id,
    UserRole.USER
  );

  return expect(
    userMutations.createUserByEmailInvite(dummyUserWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'email@google.com',
      userRole: UserRole.USER,
    })
  ).resolves.toStrictEqual(emailInviteResponse);
});

test('A user must be logged in to invite another user by email', () => {
  return expect(
    userMutations.createUserByEmailInvite(null, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'email@google.com',
      userRole: UserRole.USER,
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('A user cannot invite another user by email if the user already has an account', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUserNotOnProposalWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: dummyUser.email,
      userRole: UserRole.USER,
    })
  ).resolves.toHaveProperty('reason', 'ACCOUNT_EXIST');
});

test('A user can reinvite another user by email if the user has not created an account', () => {
  const emailInviteResponse = new EmailInviteResponse(
    dummyPlaceHolderUser.id,
    dummyUser.id,
    UserRole.USER
  );

  return expect(
    userMutations.createUserByEmailInvite(dummyUserWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: dummyPlaceHolderUser.email,
      userRole: UserRole.USER,
    })
  ).resolves.toStrictEqual(emailInviteResponse);
});

test('A user officer can invite a reviewer by email', () => {
  const emailInviteResponse = new EmailInviteResponse(
    dummyPlaceHolderUser.id,
    dummyUserOfficer.id,
    UserRole.REVIEWER
  );

  return expect(
    userMutations.createUserByEmailInvite(dummyUserOfficerWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: dummyPlaceHolderUser.email,
      userRole: UserRole.REVIEWER,
    })
  ).resolves.toStrictEqual(emailInviteResponse);
});

test('A user cannot invite a reviewer by email', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUserWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'email@google.com',
      userRole: UserRole.REVIEWER,
    })
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

test('A user can update its own name', () => {
  return expect(
    userMutations.update(dummyUserWithRole, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toBe(dummyUser);
});

test('A user cannot update another users name', () => {
  return expect(
    userMutations.update(dummyUserNotOnProposalWithRole, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A not logged in user cannot update another users name', () => {
  return expect(
    userMutations.update(null, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('A userofficer can update another users name', () => {
  return expect(
    userMutations.update(dummyUserOfficerWithRole, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toBe(dummyUser);
});

test('A user cannot update its roles', () => {
  return expect(
    userMutations.update(dummyUserWithRole, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
      roles: [1, 2],
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A userofficer can update users roles', () => {
  return expect(
    userMutations.update(dummyUserOfficerWithRole, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
      roles: [1, 2],
    })
  ).resolves.toBe(dummyUser);
});

test('A user should be able to login with credentials and get a token', () => {
  return expect(
    userMutations
      .login(null, { email: dummyUser.email, password: 'Test1234!' })
      .then(data => typeof data)
  ).resolves.toBe('string');
});

test('A user should not be able to login with invalid credentials', () => {
  return expect(
    userMutations.login(null, {
      email: dummyUser.email,
      password: 'WrongPassword!',
    })
  ).resolves.toHaveProperty('reason', 'WRONG_EMAIL_OR_PASSWORD');
});

test('A user should not be able to update a token if it is unvalid', () => {
  return expect(
    userMutations.token('this_is_a_invalid_token')
  ).resolves.toHaveProperty('reason', 'BAD_TOKEN');
});

test('A user should not be able to update a token if it is expired', () => {
  return expect(userMutations.token(badToken)).resolves.toHaveProperty(
    'reason',
    'BAD_TOKEN'
  );
});

test('A user should be able to update a token if valid', () => {
  return expect(
    userMutations.token(goodToken).then(data => typeof data)
  ).resolves.toBe('string');
});

test('A user can reset its password by providing a valid email', () => {
  return expect(
    userMutations.resetPasswordEmail(null, { email: dummyUser.email })
  ).resolves.toHaveProperty('user');
});

test('A user gets an error if providing a email not attached to a account', () => {
  return expect(
    userMutations.resetPasswordEmail(null, { email: 'dummyemail@ess.se' })
  ).resolves.toHaveProperty('reason', 'COULD_NOT_FIND_USER_BY_EMAIL');
});

test('A user can update its password if it has a valid token', () => {
  return expect(
    userMutations.resetPassword(null, {
      token: goodToken,
      password: 'Test1234!',
    })
  ).resolves.toBeInstanceOf(BasicUserDetails);
});

test('A user can not update its password if it has a bad token', () => {
  return expect(
    userMutations.resetPassword(null, {
      token: badToken,
      password: 'Test1234!',
    })
  ).resolves.toHaveProperty('reason');
});

test('A user can update its password ', () => {
  return expect(
    userMutations.updatePassword(dummyUserWithRole, {
      id: dummyUser.id,
      password: 'Test1234!',
    })
  ).resolves.toBeInstanceOf(BasicUserDetails);
});

test('A user can not update another users password ', () => {
  return expect(
    userMutations.updatePassword(dummyUserNotOnProposalWithRole, {
      id: dummyUser.id,
      password: 'Test1234!',
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A not logged in users can not update passwords ', () => {
  return expect(
    userMutations.updatePassword(null, {
      id: dummyUser.id,
      password: 'Test1234!',
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('A user officer can update any password ', () => {
  return expect(
    userMutations.updatePassword(dummyUserOfficerWithRole, {
      id: dummyUser.id,
      password: 'Test1234!',
    })
  ).resolves.toBeInstanceOf(BasicUserDetails);
});

test('A user must not be able to obtain token for another user', async () => {
  return expect(
    isRejection(
      await userMutations.getTokenForUser(dummyUserWithRole, {
        userId: dummyUserOfficer.id,
      })
    )
  ).toBe(true);
});

test('A user must not be able to delete another user', async () => {
  return expect(
    isRejection(
      await userMutations.delete(dummyUserWithRole, {
        id: dummyUserNotOnProposal.id,
      })
    )
  ).toBe(true);
});

test('A user officer can must be able to delete another user', async () => {
  return expect(
    userMutations.delete(dummyUserOfficerWithRole, { id: dummyUser.id })
  ).resolves.toBe(dummyUser);
});
