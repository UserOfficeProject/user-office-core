jest.mock('../utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('@user-office-software/duo-logger', () => ({
  logger: {
    logWarn: jest.fn(),
  },
}));

import { logger } from '@user-office-software/duo-logger';
import { container } from 'tsyringe';

import {
  basicDummyUser,
  basicDummyUserNotOnProposal,
  dummyUser,
  dummyUserOfficer,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import {
  AuthJwtApiTokenPayload,
  AuthJwtPayload,
  UserJWT,
} from '../models/User';
import { verifyToken } from '../utils/jwt';
import UserQueries from './UserQueries';

const userQueries = container.resolve(UserQueries);

describe('UserQueries', () => {
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

  describe('checkToken', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const validPayload: AuthJwtPayload | AuthJwtApiTokenPayload = {
      user: { email: 'testUser' } as UserJWT,
      accessTokenId: 'testToken',
    };

    const invalidPayload = {
      invalidKey: 'invalidValue',
    };

    it('should returns valid response if token is valid', async () => {
      (verifyToken as jest.Mock).mockReturnValueOnce(validPayload);

      const result = await userQueries.checkToken('validToken');

      expect(result).toEqual({
        isValid: true,
        payload: validPayload,
      });
    });

    it('should return invalid response if token is invalid', async () => {
      (verifyToken as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = await userQueries.checkToken('invalidToken');

      expect(result).toEqual({
        isValid: false,
        payload: null,
      });

      expect(logger.logWarn).toHaveBeenCalledWith(
        'The given token is invalid',
        { error: Error('Invalid token'), token: 'invalidToken' }
      );
    });

    it('should return invalid response if token payload is malformed', async () => {
      (verifyToken as jest.Mock).mockReturnValueOnce(invalidPayload);

      const result = await userQueries.checkToken('malformedToken');

      expect(result).toEqual({
        isValid: false,
        payload: null,
      });

      expect(logger.logWarn).toHaveBeenCalledWith(
        'The given token is invalid',
        { error: Error('Unknown or malformed token'), token: 'malformedToken' }
      );
    });
  });
});
