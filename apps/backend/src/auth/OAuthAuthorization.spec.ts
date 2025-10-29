const mockOpenIdClient = {
  login: jest.fn().mockResolvedValue({}),
  loginUrl: jest.fn().mockResolvedValue('http://test.com'),
  logoutUrl: jest.fn().mockReturnValue('http://test.com'),
  hasConfig: jest.fn().mockReturnValue({}),
  getInstance: jest.fn().mockReturnValue({
    issuer: {
      metadata: {
        issuer: 'test',
      },
    },
  }),
};

jest.mock('@user-office-software/openid', () => {
  return {
    OpenIdClient: mockOpenIdClient,
  };
});

import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { dummyUser } from '../datasources/mockups/UserDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Institution } from '../models/Institution';
import { User, UserRole } from '../models/User';
import { OAuthAuthorization } from './OAuthAuthorization';

describe('OAuthAuthorization', () => {
  let oauthAuthorization: OAuthAuthorization;
  let mockUserDataSource: UserDataSource;
  let mockAdminDataSource: AdminDataSource;

  const mockOpenIdLoginResponse = ({
    user,
    rorId = 'testRorId',
    name = 'testName',
    country = 'testCountry',
  }: {
    user: User;
    rorId?: string;
    name?: string;
    country?: string;
  }) =>
    (mockOpenIdClient.login = jest.fn().mockResolvedValue({
      userProfile: {
        ...user,
        institution_ror_id: rorId,
        institution_name: name,
        institution_country: country,
        sub: 'testSub',
      },
      tokenSet: 'test',
    }));

  beforeEach(() => {
    oauthAuthorization = new OAuthAuthorization();
    mockUserDataSource = container.resolve(Tokens.UserDataSource);
    mockAdminDataSource = container.resolve(Tokens.AdminDataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('if OIDC response institution is found, should not create a new institution', async () => {
    const expectedInstitutionId = 666;
    const testCountry = {
      countryId: 999,
      country: 'testCountry',
    };
    jest.spyOn(mockUserDataSource, 'update').mockResolvedValue({} as User);
    jest
      .spyOn(mockAdminDataSource, 'getInstitutionByRorId')
      .mockResolvedValue({ id: expectedInstitutionId } as Institution);
    jest
      .spyOn(mockAdminDataSource, 'getInstitutionByName')
      .mockResolvedValue(null);
    jest
      .spyOn(mockAdminDataSource, 'createCountry')
      .mockResolvedValue(testCountry);
    jest
      .spyOn(mockAdminDataSource, 'createInstitution')
      .mockResolvedValue(null);

    jest.spyOn(mockAdminDataSource, 'getCountryByName').mockResolvedValue(null);

    mockOpenIdLoginResponse({ user: dummyUser });
    await oauthAuthorization.externalTokenLogin('valid', '', null);

    expect(mockAdminDataSource.createCountry).not.toHaveBeenCalled();
    expect(mockAdminDataSource.createInstitution).not.toHaveBeenCalled();
    expect(mockAdminDataSource.getInstitutionByName).not.toHaveBeenCalled();
    expect(
      (mockUserDataSource.update as jest.Mock).mock.calls[0][0].institutionId
    ).toBe(expectedInstitutionId);
  });

  it('if OIDC response institution is not found, should create a new institution', async () => {
    const expectedInstitutionId = 666;
    const testCountry = {
      countryId: 999,
      country: 'testCountry',
    };

    jest.spyOn(mockUserDataSource, 'update').mockResolvedValue({} as User);
    jest
      .spyOn(mockAdminDataSource, 'getInstitutionByRorId')
      .mockResolvedValue(null);

    jest
      .spyOn(mockAdminDataSource, 'getInstitutionByName')
      .mockResolvedValue(null);

    jest
      .spyOn(mockAdminDataSource, 'getCountryByName')
      .mockResolvedValue(testCountry);

    jest
      .spyOn(mockAdminDataSource, 'createInstitution')
      .mockResolvedValue({ id: expectedInstitutionId } as Institution);

    mockOpenIdLoginResponse({ user: dummyUser });
    await oauthAuthorization.externalTokenLogin('valid', '', null);

    expect(mockAdminDataSource.createCountry).not.toHaveBeenCalled();
    expect(mockAdminDataSource.createInstitution).toHaveBeenCalledWith({
      name: 'testName',
      country: testCountry.countryId,
      rorId: 'testRorId',
    });
    expect(
      (mockUserDataSource.update as jest.Mock).mock.calls[0][0].institutionId
    ).toBe(expectedInstitutionId);
  });

  it('if OIDC response institution country is not found, should create a new country', async () => {
    const expectedInstitutionId = 666;
    const testCountry = {
      countryId: 999,
      country: 'testCountry',
    };

    jest.spyOn(mockUserDataSource, 'update').mockResolvedValue({} as User);
    jest
      .spyOn(mockAdminDataSource, 'getInstitutionByRorId')
      .mockResolvedValue(null);
    jest
      .spyOn(mockAdminDataSource, 'getInstitutionByName')
      .mockResolvedValue(null);

    jest.spyOn(mockAdminDataSource, 'getCountryByName').mockResolvedValue(null);
    jest
      .spyOn(mockAdminDataSource, 'createCountry')
      .mockResolvedValue(testCountry);

    jest
      .spyOn(mockAdminDataSource, 'createInstitution')
      .mockResolvedValue({ id: expectedInstitutionId } as Institution);

    mockOpenIdLoginResponse({ user: dummyUser });
    await oauthAuthorization.externalTokenLogin('valid', '', null);

    expect(mockAdminDataSource.createCountry).toHaveBeenCalledWith(
      testCountry.country
    );
    expect(mockAdminDataSource.createInstitution).toHaveBeenCalledWith({
      name: 'testName',
      country: testCountry.countryId,
      rorId: 'testRorId',
    });

    expect(
      (mockUserDataSource.update as jest.Mock).mock.calls[0][0].institutionId
    ).toBe(expectedInstitutionId);
  });

  it('if OIDC response institution is not provided, should update user with original institutionId', async () => {
    jest
      .spyOn(mockAdminDataSource, 'getInstitutionByRorId')
      .mockResolvedValue(null);
    jest
      .spyOn(mockAdminDataSource, 'getInstitutionByName')
      .mockResolvedValue(null);

    mockOpenIdLoginResponse({
      user: dummyUser,
      rorId: '',
      name: '',
      country: '',
    });
    await oauthAuthorization.externalTokenLogin('valid', '', null);

    expect(mockAdminDataSource.getInstitutionByRorId).not.toHaveBeenCalled();
    expect(mockAdminDataSource.getInstitutionByName).not.toHaveBeenCalled();

    expect(
      (mockUserDataSource.update as jest.Mock).mock.calls[0][0].institutionId
    ).toBe(dummyUser.institutionId);
  });

  describe('upsertUser->create: INITIAL_USER_OFFICER_EMAIL', () => {
    it('should assign USER_OFFICER role if the email is the INITIAL_USER_OFFICER_EMAIL', async () => {
      process.env.INITIAL_USER_OFFICER_EMAIL = dummyUser.email;

      jest.spyOn(mockUserDataSource, 'addUserRole').mockResolvedValue(true);
      jest.spyOn(mockUserDataSource, 'getByOIDCSub').mockResolvedValue(null);
      jest.spyOn(mockUserDataSource, 'getByEmail').mockResolvedValue(null);
      jest
        .spyOn(mockUserDataSource, 'create')
        .mockResolvedValue({ ...dummyUser });

      mockOpenIdLoginResponse({
        user: dummyUser,
      });

      await oauthAuthorization.externalTokenLogin('valid', '', null);

      expect(mockUserDataSource.addUserRole).toHaveBeenCalledWith({
        userID: expect.any(Number),
        roleID: UserRole.USER_OFFICER,
      });
    });

    it('should assign USER role if the email is not the INITIAL_USER_OFFICER_EMAIL', async () => {
      process.env.INITIAL_USER_OFFICER_EMAIL = 'someotheremail';

      jest.spyOn(mockUserDataSource, 'addUserRole').mockResolvedValue(true);
      jest.spyOn(mockUserDataSource, 'getByOIDCSub').mockResolvedValue(null);
      jest.spyOn(mockUserDataSource, 'getByEmail').mockResolvedValue(null);

      mockOpenIdLoginResponse({
        user: dummyUser,
      });

      await oauthAuthorization.externalTokenLogin('valid', '', null);

      expect(mockUserDataSource.addUserRole).toHaveBeenCalledWith({
        userID: expect.any(Number),
        roleID: UserRole.USER,
      });
    });

    it('should assign USER role if INITIAL_USER_OFFICER_EMAIL is not set', async () => {
      delete process.env.INITIAL_USER_OFFICER_EMAIL;
      jest.spyOn(mockUserDataSource, 'addUserRole').mockResolvedValue(true);
      jest.spyOn(mockUserDataSource, 'getByOIDCSub').mockResolvedValue(null);
      jest.spyOn(mockUserDataSource, 'getByEmail').mockResolvedValue(null);

      mockOpenIdLoginResponse({
        user: dummyUser,
      });

      await oauthAuthorization.externalTokenLogin('valid', '', null);

      expect(mockUserDataSource.addUserRole).toHaveBeenCalledWith({
        userID: expect.any(Number),
        roleID: UserRole.USER,
      });
    });

    it.each([[null], [undefined], ['']])(
      'should assign USER role if INITIAL_USER_OFFICER_EMAIL is not set and there is no email (%p)',
      async (email: null | undefined | string) => {
        delete process.env.INITIAL_USER_OFFICER_EMAIL;
        jest.spyOn(mockUserDataSource, 'addUserRole').mockResolvedValue(true);
        jest.spyOn(mockUserDataSource, 'getByOIDCSub').mockResolvedValue(null);
        jest.spyOn(mockUserDataSource, 'getByEmail').mockResolvedValue(null);
        jest
          .spyOn(mockUserDataSource, 'create')
          .mockResolvedValue({ ...dummyUser, email } as any);

        mockOpenIdLoginResponse({
          user: dummyUser,
        });

        await oauthAuthorization.externalTokenLogin('valid', '', null);

        expect(mockUserDataSource.addUserRole).toHaveBeenCalledWith({
          userID: expect.any(Number),
          roleID: UserRole.USER,
        });
      }
    );

    it('should not assign any role if the user already exists', async () => {
      jest.spyOn(mockUserDataSource, 'addUserRole').mockResolvedValue(true);
      jest
        .spyOn(mockUserDataSource, 'getByOIDCSub')
        .mockResolvedValue(dummyUser);

      mockOpenIdLoginResponse({
        user: dummyUser,
      });

      await oauthAuthorization.externalTokenLogin('valid', '', null);

      expect(mockUserDataSource.addUserRole).not.toHaveBeenCalled();
    });
  });
});
