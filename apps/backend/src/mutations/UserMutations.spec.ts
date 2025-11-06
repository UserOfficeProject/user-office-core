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
import { isRejection, Rejection } from '../models/Rejection';
import { AuthJwtPayload, User, UserRole } from '../models/User';
import { verifyToken } from '../utils/jwt';
import UserMutations from './UserMutations';

const secret = process.env.JWT_SECRET as string;

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
  ).rejects.toThrow('Can not create account because account already exists');
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
    UserRole.FAP_REVIEWER
  );

  return expect(
    userMutations.createUserByEmailInvite(dummyUserOfficerWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: dummyPlaceHolderUser.email,
      userRole: UserRole.FAP_REVIEWER,
    })
  ).resolves.toStrictEqual(emailInviteResponse);
});

test('A user cannot invite a reviewer by email', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUserWithRole, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'email@google.com',
      userRole: UserRole.FAP_REVIEWER,
    })
  ).rejects.toThrow('Can not create user for this role');
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
  const result = await userMutations.externalTokenLogin('valid', '', null);

  expect(typeof result).toBe('string');

  const decoded = verifyToken<AuthJwtPayload>(result as string);
  expect(decoded.user.id).toBe(dummyUser.id);
});

// Tests for updateUserByOidcSub functionality
describe('updateUserByOidcSub', () => {
  test('A user can update their own profile by OIDC sub', async () => {
    const result = await userMutations.updateUserByOidcSub(dummyUserWithRole, {
      oidcSub: dummyUser.oidcSub as string,
      firstname: 'UpdatedJane',
      lastname: 'UpdatedDoe',
      email: 'updated.jane@example.com',
      id: dummyUser.id,
    });

    expect(result).toEqual({
      ...dummyUser,
      firstname: 'UpdatedJane',
      lastname: 'UpdatedDoe',
      email: 'updated.jane@example.com',
    });
  });

  test('A user officer can update another user by OIDC sub', async () => {
    const result = await userMutations.updateUserByOidcSub(
      dummyUserOfficerWithRole,
      {
        oidcSub: dummyUser.oidcSub as string,
        firstname: 'OfficerUpdatedJane',
        department: 'Updated Department',
        id: dummyUser.id,
      }
    );

    expect(result).toEqual({
      ...dummyUser,
      firstname: 'OfficerUpdatedJane',
      department: 'Updated Department',
    });
  });
  test('A user cannot update another user by OIDC sub', async () => {
    const result = await userMutations.updateUserByOidcSub(
      dummyUserNotOnProposalWithRole,
      {
        oidcSub: dummyUser.oidcSub as string,
        firstname: 'ShouldNotUpdate',
        id: dummyUser.id,
      }
    );

    expect(isRejection(result)).toBe(true);
    expect((result as Rejection).reason).toBe(
      'Can not update user because of insufficient permissions'
    );
  });

  test('A not logged in user cannot update a user by OIDC sub', async () => {
    const result = await userMutations.updateUserByOidcSub(null, {
      oidcSub: dummyUser.oidcSub as string,
      firstname: 'ShouldNotUpdate',
      id: dummyUser.id,
    });

    expect(isRejection(result)).toBe(true);
    expect((result as Rejection).reason).toBe('NOT_LOGGED_IN');
  });

  test('A user can update partial profile data by OIDC sub', async () => {
    const result = await userMutations.updateUserByOidcSub(dummyUserWithRole, {
      oidcSub: dummyUser.oidcSub as string,
      telephone: '+1-555-9999',
      position: 'Senior Architect',
      id: dummyUser.id,
    });

    expect(result).toEqual({
      ...dummyUser,
      telephone: '+1-555-9999',
      position: 'Senior Architect',
    });
  });

  test('A user cannot update someone else profile even with their own OIDC sub when trying to update different user', async () => {
    // Simulate user with different OIDC sub trying to update dummyUser
    const userWithDifferentOidcSub = {
      ...dummyUserNotOnProposalWithRole,
      oidcSub: 'different-oidc-sub',
    };

    const result = await userMutations.updateUserByOidcSub(
      userWithDifferentOidcSub,
      {
        oidcSub: dummyUser.oidcSub as string,
        firstname: 'ShouldNotUpdate',
        id: dummyUser.id,
      }
    );

    expect(isRejection(result)).toBe(true);
    expect((result as Rejection).reason).toBe(
      'Can not update user because of insufficient permissions'
    );
  });

  test('Empty update object should work', async () => {
    const result = await userMutations.updateUserByOidcSub(dummyUserWithRole, {
      oidcSub: dummyUser.oidcSub as string,
      id: dummyUser.id,
    });

    expect(result).toEqual(dummyUser);
  });

  test('Update should preserve original user data for unspecified fields', async () => {
    const result = await userMutations.updateUserByOidcSub(dummyUserWithRole, {
      oidcSub: dummyUser.oidcSub as string,
      firstname: 'OnlyFirstName',
      id: dummyUser.id,
    });

    expect(result).toEqual({
      ...dummyUser,
      firstname: 'OnlyFirstName',
    });

    // Verify other fields remain unchanged
    expect(isRejection(result)).toBe(false);
    expect((result as typeof dummyUser).lastname).toBe(dummyUser.lastname);
    expect((result as typeof dummyUser).email).toBe(dummyUser.email);
    expect((result as typeof dummyUser).department).toBe(dummyUser.department);
  });
});

describe('upsertUserByOidcSub', () => {
  test('A user can be created if OIDC sub does not exist', async () => {
    const newOidcSub = 'new-unique-oidc-sub';
    const result = await userMutations.upsertUserByOidcSub(
      dummyUserOfficerWithRole,
      {
        oidcSub: newOidcSub,
        firstName: 'New',
        lastName: 'User',
        email: 'new.user@example.com',
        userTitle: null,
        username: null,
        preferredName: null,
        gender: null,
        birthDate: null,
        institutionRoRId: '',
        department: null,
        position: '',
        telephone: null,
        institutionName: '',
        institutionCountry: '',
      }
    );
    // Check if the result has the oidcsub
    expect(isRejection(result)).toBe(false);
    expect((result as User).oidcSub).toBe(newOidcSub);
  });
  test('A user will be updated if OIDC sub exists', async () => {
    const result = await userMutations.upsertUserByOidcSub(
      dummyUserOfficerWithRole,
      {
        oidcSub: dummyUser.oidcSub as string,
        firstName: 'UpsertedJane',
        lastName: 'UpsertedDoe',
        email: 'upserted.jane.doe@example.com',
        userTitle: null,
        username: null,
        preferredName: null,
        gender: null,
        birthDate: null,
        institutionRoRId: '',
        department: null,
        position: '',
        telephone: null,
        institutionName: '',
        institutionCountry: '',
      }
    );

    // Check if the result has the oidcsub
    expect(isRejection(result)).toBe(false);
    expect((result as User).oidcSub).toBe(dummyUser.oidcSub);
  });

  test('A new user can be created where the institution will be fetched from institutionRoRId', async () => {
    const newOidcSub = 'user-with-existing-institution-ror';
    const existingRorId = 'https://ror.org/dummy001'; // Dummy Research Institute from our mock

    const result = await userMutations.upsertUserByOidcSub(
      dummyUserOfficerWithRole,
      {
        oidcSub: newOidcSub,
        firstName: 'John',
        lastName: 'Scientist',
        email: 'john.scientist@dummy-research.org',
        userTitle: 'Dr.',
        username: 'jscientist',
        preferredName: 'Johnny',
        gender: 'male',
        birthDate: '1985-05-15',
        institutionRoRId: existingRorId, // This should find Dummy Research Institute in our mock
        institutionName: 'CERN', // This should match the existing institution
        institutionCountry: 'Switzerland',
        department: 'Physics Department',
        position: 'Senior Researcher',
        telephone: '+41-22-767-6111',
      }
    );

    expect(isRejection(result)).toBe(false);
    const createdUser = result as User;

    // Should use existing institution (Dummy Research Institute has ID 3 in our mock)
    expect(createdUser.institutionId).toBe(3);
    expect(createdUser.firstname).toBe('John');
    expect(createdUser.lastname).toBe('Scientist');
    expect(createdUser.email).toBe('john.scientist@dummy-research.org');
    expect(createdUser.oidcSub).toBe(newOidcSub);
  });

  test('A new user can be created where the institution will be created newly for the new institutionRoRId', async () => {
    const newOidcSub = 'user-with-new-institution-ror';
    const newRorId = 'https://ror.org/05a28rw58'; // New ROR ID not in our mock

    const result = await userMutations.upsertUserByOidcSub(
      dummyUserOfficerWithRole,
      {
        oidcSub: newOidcSub,
        firstName: 'Maria',
        lastName: 'Researcher',
        email: 'maria.researcher@newinstitute.edu',
        userTitle: 'Prof.',
        username: 'mresearcher',
        preferredName: 'Maria',
        gender: 'female',
        birthDate: '1980-03-22',
        institutionRoRId: newRorId, // This ROR ID doesn't exist in mock
        institutionName: 'New Research Institute',
        institutionCountry: 'Germany',
        department: 'Materials Science',
        position: 'Principal Investigator',
        telephone: '+49-30-12345678',
      }
    );

    expect(isRejection(result)).toBe(false);
    const createdUser = result as User;

    // Should create new institution and assign it
    // The new institution should have ID 6 (next available in our mock)
    expect(createdUser.institutionId).toBe(6);
    expect(createdUser.firstname).toBe('Maria');
    expect(createdUser.lastname).toBe('Researcher');
    expect(createdUser.email).toBe('maria.researcher@newinstitute.edu');
    expect(createdUser.oidcSub).toBe(newOidcSub);
  });
});
