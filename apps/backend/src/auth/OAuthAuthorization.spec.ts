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
import { User } from '../models/User';
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
});
