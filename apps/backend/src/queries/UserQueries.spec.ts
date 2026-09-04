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

import UserQueries from './UserQueries';
import { Tokens } from '../config/Tokens';
import {
  basicDummyUser,
  basicDummyUserNotOnProposal,
  dummyProposalMemberWithRole,
  dummySecondVisitorWithRole,
  dummyThirdVisitorWithRole,
  dummyUser,
  dummyUserNotOnProposalWithRole,
  dummyUserOfficer,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
  dummyVisitorWithRole,
  dummyVisitTeamLeadWithRole,
} from '../datasources/mockups/UserDataSource';
import { VisitDataSourceMock } from '../datasources/mockups/VisitDataSource';
import {
  AuthJwtApiTokenPayload,
  AuthJwtPayload,
  UserJWT,
} from '../models/User';
import { verifyToken } from '../utils/jwt';

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
      userQueries.getAll(dummyUserOfficerWithRole, { searchText: '' })
    ).resolves.toStrictEqual({
      totalCount: 2,
      users: [basicDummyUser, basicDummyUserNotOnProposal],
    });
  });

  test('A user is allowed to fetch all relevant accounts', () => {
    return expect(
      userQueries.getAll(dummyUserWithRole, { searchText: '' })
    ).resolves.toStrictEqual({
      totalCount: 2,
      users: [basicDummyUser, basicDummyUserNotOnProposal],
    });
  });

  test('A user that is not logged in is not allowed to fetch all accounts', () => {
    return expect(userQueries.getAll(null, { searchText: '' })).resolves.toBe(
      null
    );
  });

  test('A user is not allowed to fetch roles', () => {
    return expect(userQueries.getRoles(dummyUserWithRole)).resolves.toBe(null);
  });

  /*
   * Visit 5 sits on proposal 1. Its team lead and visitors are not members of
   * that proposal, so the only thing that can grant a proposal member sight of
   * them is the visit itself.
   */
  describe('getBasic for the people on a visit', () => {
    const visitDataSource = container.resolve<VisitDataSourceMock>(
      Tokens.VisitDataSource
    );

    beforeEach(() => {
      visitDataSource.init();
    });

    test('A member of the proposal can read the basic details of the visit team lead', async () => {
      const teamLead = await userQueries.getBasic(
        dummyProposalMemberWithRole,
        dummyVisitTeamLeadWithRole.id
      );

      expect(teamLead).toHaveProperty('id', dummyVisitTeamLeadWithRole.id);
    });

    test.each([
      ['the first visitor', dummyVisitorWithRole.id],
      ['the second visitor', dummySecondVisitorWithRole.id],
      ['the third visitor', dummyThirdVisitorWithRole.id],
    ])(
      'A member of the proposal can read the basic details of %s',
      async (_label, visitorId) => {
        const visitor = await userQueries.getBasic(
          dummyProposalMemberWithRole,
          visitorId
        );

        expect(visitor).toHaveProperty('id', visitorId);
      }
    );

    test('A user who is on neither the proposal nor the visit can not read the team lead', async () => {
      const teamLead = await userQueries.getBasic(
        dummyUserNotOnProposalWithRole,
        dummyVisitTeamLeadWithRole.id
      );

      expect(teamLead).toBeNull();
    });
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
        'Unknown or malformed token',
        { token: 'malformedToken', payload: invalidPayload }
      );
    });
  });
});
