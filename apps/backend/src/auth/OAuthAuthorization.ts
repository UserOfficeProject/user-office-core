import { env } from 'process';
import 'reflect-metadata';

import { logger } from '@user-office-software/duo-logger';
import { OpenIdClient } from '@user-office-software/openid';
import { ValidTokenSet } from '@user-office-software/openid/lib/model/ValidTokenSet';
import { ValidUserInfo } from '@user-office-software/openid/lib/model/ValidUserInfo';
import { GraphQLError } from 'graphql';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { Institution } from '../models/Institution';
import { Rejection } from '../models/Rejection';
import { SettingsId } from '../models/Settings';
import { AuthJwtPayload, User, UserRole } from '../models/User';
import { GetOrCreateInstitutionInput } from '../resolvers/mutations/UpsertUserMutation';
import { UserAuthorization } from './UserAuthorization';

export class OAuthAuthorization extends UserAuthorization {
  private db = container.resolve<AdminDataSource>(Tokens.AdminDataSource);

  constructor() {
    super();

    if (OpenIdClient.hasConfig()) {
      this.initialize();
    } else {
      throw new GraphQLError(
        'OpenIdClient has no configuration. Please check your environment variables!'
      );
    }
  }
  public async externalTokenLogin(
    code: string,
    redirectUri: string,
    iss: string | null
  ): Promise<User | null> {
    try {
      const { userProfile, tokenSet } = await OpenIdClient.login(
        code,
        redirectUri,
        iss
      );

      const user = await this.upsertUser(userProfile, tokenSet);

      return user;
    } catch (error) {
      logger.logError('Error ocurred while logging in with external token', {
        error: (error as Error)?.message,
        stack: (error as Error)?.stack,
      });

      throw new Error(error as string);
    }
  }

  async logout(uosToken: AuthJwtPayload): Promise<string | Rejection> {
    return 'logged out';
  }

  public async isExternalTokenValid(code: string): Promise<boolean> {
    // No need to check external token validity, because we check UOS JWT token
    return true;
  }

  async initialize() {
    const loginUrl = await OpenIdClient.loginUrl();
    const logoutUrl = await OpenIdClient.logoutUrl();

    await this.db.updateSettings({
      settingsId: SettingsId.EXTERNAL_AUTH_LOGIN_URL,
      settingsValue: loginUrl,
    });

    await this.db.updateSettings({
      settingsId: SettingsId.EXTERNAL_AUTH_LOGOUT_URL,
      settingsValue: logoutUrl,
    });
  }

  private async getOrCreateInstitutionByRorId(
    rorId: string
  ): Promise<Institution | null> {
    let institution = await this.adminDataSource.getInstitutionByRorId(rorId);
    if (!institution) {
      institution = await this.adminDataSource.createInstitution({
        name: 'New Institution',
        country: 1,
        rorId: rorId,
      });
    }

    return institution;
  }

  private async getOrCreateInstitutionByManualInput(manualInput: {
    name: string;
    country: string;
  }): Promise<Institution | null> {
    let institution = await this.adminDataSource.getInstitutionByName(
      manualInput.name
    );

    if (!institution) {
      let country = await this.adminDataSource.getCountryByName(
        manualInput.country
      );
      if (!country) {
        // create country if it does not exist
        country = await this.adminDataSource.createCountry(manualInput.country);
      }
      institution = await this.adminDataSource.createInstitution({
        name: manualInput.name,
        country: country.countryId,
        rorId: undefined,
      });
    }

    return institution;
  }

  private async getOrCreateInstitutionById(
    id: number
  ): Promise<Institution | null> {
    const institution = await this.adminDataSource.getInstitution(id);

    return institution;
  }

  public async getOrCreateUserInstitution(input: GetOrCreateInstitutionInput) {
    let institution: Institution | null = null;
    if (typeof input === 'string') {
      // ROR ID provided
      institution = await this.getOrCreateInstitutionByRorId(input);
    } else if (input instanceof Object) {
      // Manual institution details provided
      institution = await this.getOrCreateInstitutionByManualInput(input);
    } else if (typeof input === 'number') {
      // Institution ID provided
      institution = await this.getOrCreateInstitutionById(input);
    }

    return institution;
  }

  private async upsertUser(
    userInfo: ValidUserInfo,
    tokenSet: ValidTokenSet
  ): Promise<User> {
    const client = await OpenIdClient.getInstance();
    let institutionInput: GetOrCreateInstitutionInput = null;
    if (userInfo.institution_ror_id) {
      institutionInput = userInfo.institution_ror_id as string;
    } else if (userInfo.institution_name && userInfo.institution_country) {
      institutionInput = {
        country: userInfo.institution_country as string,
        name: userInfo.institution_name as string,
      };
    }

    const institution = await this.getOrCreateUserInstitution(institutionInput);
    const userWithOAuthSubMatch = await this.userDataSource.getByOIDCSub(
      userInfo.sub
    );

    const userWithEmailMatch = await this.userDataSource.getByEmail(
      userInfo.email
    );

    const user = userWithOAuthSubMatch ?? userWithEmailMatch;

    if (user) {
      const updatedUser = await this.userDataSource.update({
        ...user,
        birthdate: userInfo.birthdate
          ? new Date(userInfo.birthdate)
          : undefined,
        department: userInfo.department as string,
        email: userInfo.email,
        firstname: userInfo.given_name,
        gender: userInfo.gender,
        lastname: userInfo.family_name,
        oauthIssuer: client.issuer.metadata.issuer,
        oauthRefreshToken: tokenSet.refresh_token ?? '',
        oidcSub: userInfo.sub,
        institutionId: institution?.id ?? user.institutionId,
        position: userInfo.position as string,
        preferredname: userInfo.preferred_username,
        telephone: userInfo.phone_number,
        user_title: userInfo.title as string,
      });

      return updatedUser;
    } else {
      const newUser = await this.userDataSource.create(
        (userInfo.title as string) ?? 'unspecified',
        userInfo.given_name,
        userInfo.family_name,
        userInfo.email,
        userInfo.preferred_username ?? '',
        userInfo.sub,
        tokenSet.refresh_token ?? '',
        client.issuer.metadata.issuer,
        userInfo.gender ?? 'unspecified',
        new Date(),
        institution?.id ?? 1,
        '',
        (userInfo.position as string) ?? '',
        userInfo.email,
        ''
      );

      const roleID = this.getUserRole(newUser);

      await this.userDataSource.addUserRole({
        userID: newUser.id,
        roleID,
      });

      if (roleID === UserRole.USER_OFFICER) {
        logger.logInfo('Initial User Officer created', {
          email: newUser.email,
        });
      }

      return newUser;
    }
  }

  private getUserRole(newUser: { id: number; email: string }): UserRole {
    const roleID =
      env.INITIAL_USER_OFFICER_EMAIL &&
      newUser.email === env.INITIAL_USER_OFFICER_EMAIL
        ? UserRole.USER_OFFICER
        : UserRole.USER;

    return roleID;
  }
}
