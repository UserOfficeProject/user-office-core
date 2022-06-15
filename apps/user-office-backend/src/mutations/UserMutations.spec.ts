import jsonwebtoken from 'jsonwebtoken';
import { container } from 'tsyringe';

import {
  dummyPlaceHolderUser,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer,
  dummyUserWithRole,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
} from '../datasources/mockups/UserDataSource';
import { EmailInviteResponse } from '../models/EmailInviteResponse';
import { isRejection } from '../models/Rejection';
import { AuthJwtPayload, BasicUserDetails, UserRole } from '../models/User';
import { verifyToken } from '../utils/jwt';
import UserMutations from './UserMutations';

jest.mock('../datasources/stfc/UOWSSoapInterface');

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

const userMutations = container.resolve(UserMutations);

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
  ).resolves.toHaveProperty(
    'reason',
    'Can not create account because account already exists'
  );
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
    UserRole.SEP_REVIEWER
  );

  return expect(
    userMutations.createUserByEmailInvite(dummyUserOfficerWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: dummyPlaceHolderUser.email,
      userRole: UserRole.SEP_REVIEWER,
    })
  ).resolves.toStrictEqual(emailInviteResponse);
});

test('A user cannot invite a reviewer by email', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUserWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'email@google.com',
      userRole: UserRole.SEP_REVIEWER,
    })
  ).resolves.toHaveProperty('reason', 'Can not create user for this role');
});

test('A user can update its own name', () => {
  return expect(
    userMutations.update(dummyUserWithRole, {
      ...dummyUser,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toBe(dummyUser);
});

test('A user cannot update another users name', () => {
  return expect(
    userMutations.update(dummyUserNotOnProposalWithRole, {
      ...dummyUser,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toHaveProperty(
    'reason',
    'Can not update user because of insufficient permissions'
  );
});

test('A not logged in user cannot update another users name', () => {
  return expect(
    userMutations.update(null, {
      ...dummyUser,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('A userofficer can update another users name', () => {
  return expect(
    userMutations.update(dummyUserOfficerWithRole, {
      ...dummyUser,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toBe(dummyUser);
});

test('A user cannot update its roles', () => {
  return expect(
    userMutations.updateRoles(dummyUserWithRole, {
      id: 2,
      roles: [1, 2],
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A userofficer can update users roles', () => {
  return expect(
    userMutations.updateRoles(dummyUserOfficerWithRole, {
      id: 2,
      roles: [1, 2],
    })
  ).resolves.toBe(dummyUser);
});

test('A user should be able to login with credentials and get a token', () => {
  return expect(
    userMutations
      .login(null, { email: dummyUser.email, password: 'Test1234!' })
      .then((data) => typeof data)
  ).resolves.toBe('string');
});

test('A user should not be able to login with invalid credentials', () => {
  return expect(
    userMutations.login(null, {
      email: dummyUser.email,
      password: 'WrongPassword!',
    })
  ).resolves.toHaveProperty('reason', 'Wrong email or password');
});

test('A user should not be able to update a token if it is unvalid', () => {
  return expect(
    userMutations.token('this_is_a_invalid_token')
  ).resolves.toHaveProperty('reason', 'Bad token');
});

test('A user should not be able to update a token if it is expired', () => {
  return expect(userMutations.token(badToken)).resolves.toHaveProperty(
    'reason',
    'Bad token'
  );
});

test('A user should be able to update a token if valid', () => {
  return expect(
    userMutations.token(goodToken).then((data) => typeof data)
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
  ).resolves.toHaveProperty('reason', 'Could not find user by email');
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

test('A user can update its password', () => {
  return expect(
    userMutations.updatePassword(dummyUserWithRole, {
      id: dummyUser.id,
      password: 'Test1234!',
    })
  ).resolves.toBeInstanceOf(BasicUserDetails);
});

test('A user can not update another users password', () => {
  return expect(
    userMutations.updatePassword(dummyUserNotOnProposalWithRole, {
      id: dummyUser.id,
      password: 'Test1234!',
    })
  ).resolves.toHaveProperty(
    'reason',
    'Can not update password because of insufficient permissions'
  );
});

test('A not logged in users can not update passwords', () => {
  return expect(
    userMutations.updatePassword(null, {
      id: dummyUser.id,
      password: 'Test1234!',
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED_IN');
});

test('A user officer can update any password', () => {
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

test('externalTokenLogin supplies a new JWT', async () => {
  const result = await userMutations.externalTokenLogin('valid');

  expect(typeof result).toBe('string');

  const decoded = verifyToken<AuthJwtPayload>(result as string);
  expect(decoded.user.id).toBe(dummyUser.id);
});
