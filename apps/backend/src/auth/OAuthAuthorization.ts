import 'reflect-metadata';
import { logger } from '@user-office-software/duo-logger';
import { OpenIdClient } from '@user-office-software/openid';
import { ValidTokenSet } from '@user-office-software/openid/lib/model/ValidTokenSet';
import { ValidUserInfo } from '@user-office-software/openid/lib/model/ValidUserInfo';
import { GraphQLError } from 'graphql';
import { UserinfoResponse } from 'openid-client';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { Rejection } from '../models/Rejection';
import { SettingsId } from '../models/Settings';
import { AuthJwtPayload, User, UserRole } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

interface UserinfoResponseWithInssitution extends UserinfoResponse {
  institution_ror_id?: string;
  institution_name?: string;
  institution_country?: string;
}

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

  // NOTE: This is pingFederate idp/startSLO.ping logout template specific feature.
  // If AUTH_RELOGIN_PARAMS is set, it will be added to the logout URL as a query parameter.
  // The query parameter must be from=REDIRECT_URL
  private logoutWithRedirectParam(logoutUrl: string) {
    const reLoginParam = process.env.AUTH_RELOGIN_PARAMS?.trim();
    if (!reLoginParam) return logoutUrl;
    if (!reLoginParam.startsWith('from=', 0)) {
      logger.logError(
        'Invalid AUTH_RELOGIN_PARAMS. The variable must be from=REDRIRECT_URL',
        {
          logoutUrl,
        }
      );

      return logoutUrl;
    }

    return `${logoutUrl}?${reLoginParam}`;
  }

  public async isExternalTokenValid(code: string): Promise<boolean> {
    // No need to check external token validity, because we check UOS JWT token
    return true;
  }

  async initialize() {
    const loginUrl = await OpenIdClient.loginUrl();
    const logoutUrl = await OpenIdClient.logoutUrl();
    const logoutUrlWithParam = this.logoutWithRedirectParam(logoutUrl);

    await this.db.updateSettings({
      settingsId: SettingsId.EXTERNAL_AUTH_LOGIN_URL,
      settingsValue: loginUrl,
    });

    await this.db.updateSettings({
      settingsId: SettingsId.EXTERNAL_AUTH_LOGOUT_URL,
      settingsValue: logoutUrlWithParam,
    });
  }

  private async getUserInstitutionId(
    userInfo: UserinfoResponseWithInssitution
  ) {
    if (!userInfo.institution_name || !userInfo.institution_country) {
      return undefined;
    }

    let institution = userInfo.institution_ror_id
      ? await this.adminDataSource.getInstitutionByRorId(
          userInfo.institution_ror_id
        )
      : await this.adminDataSource.getInstitutionByName(
          userInfo.institution_name
        );

    if (!institution) {
      let institutionCountry = await this.adminDataSource.getCountryByName(
        userInfo.institution_country
      );

      if (!institutionCountry) {
        institutionCountry = await this.adminDataSource.createCountry(
          userInfo.institution_country
        );
      }
      const newInstitution = {
        name: userInfo.institution_name,
        country: institutionCountry.countryId,
        rorId: userInfo.institution_ror_id,
      };
      institution =
        await this.adminDataSource.createInstitution(newInstitution);
    }

    return institution?.id;
  }

  private async upsertUser(
    userInfo: ValidUserInfo,
    tokenSet: ValidTokenSet
  ): Promise<User> {
    const client = await OpenIdClient.getInstance();
    const institutionId = await this.getUserInstitutionId(userInfo);
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
        institutionId: institutionId ?? user.institutionId,
        position: userInfo.position as string,
        preferredname: userInfo.preferred_username,
        telephone: userInfo.phone_number,
        user_title: userInfo.title as string,
      });

      return updatedUser;
    } else {
      const newUser = await this.userDataSource.create(
        'unspecified',
        userInfo.given_name,
        undefined,
        userInfo.family_name,
        userInfo.email,
        userInfo.preferred_username,
        userInfo.sub,
        tokenSet.refresh_token ?? '',
        client.issuer.metadata.issuer,
        'unspecified',
        1,
        new Date(),
        1,
        '',
        '',
        userInfo.email,
        '',
        undefined
      );

      await this.userDataSource.addUserRole({
        userID: newUser.id,
        roleID: UserRole.USER,
      });

      return newUser;
    }
  }
}
