import { logger } from '@user-office-software/duo-logger';
import { TokenSet, UserinfoResponse } from 'openid-client';

import 'reflect-metadata';
import { rejection, Rejection } from '../models/Rejection';
import { AuthJwtPayload, User, UserRole } from '../models/User';
import { RequiredField, NonNullableField } from '../utils/helperFunctions';
import { OpenIdClient } from './OpenIdClient';
import { UserAuthorization } from './UserAuthorization';

type ValidUserInfo = RequiredField<
  UserinfoResponse,
  'sub' | 'given_name' | 'family_name' | 'email'
>;

type ValidTokenSet = RequiredField<TokenSet, 'access_token'>;

type ValidUser = NonNullableField<
  User,
  'oidcSub' | 'oidcAccessToken' | 'oidcRefreshToken'
>;

export abstract class OAuthAuthorization extends UserAuthorization {
  public async externalTokenLogin(
    code: string,
    redirectUri: string
  ): Promise<User | null> {
    try {
      const client = await OpenIdClient.getInstance();

      /**
       * Requesting Authorization server to exchange the code for a tokenset,
       ** and validating the return value that it has both - access_token and id_token
       */
      const callbackParams = new URLSearchParams();
      callbackParams.append('code', code);

      const params = client.callbackParams(`?${callbackParams.toString()}`);

      const tokenSet = this.validateTokenSet(
        await client.callback(redirectUri, params)
      );

      /**
       * Getting and validating the userProfile from the previously obtained tokenset
       */
      const userProfile = this.validateUserProfile(
        await client.userinfo<UserinfoResponse>(tokenSet)
      );

      /**
       * If the user profile is valid, then we upsert the user and return it
       */
      const user = await this.upsertUser(userProfile, tokenSet);

      return user;
    } catch (error) {
      logger.logError('Error ocurred while logging in with external token', {
        error: (error as Error)?.message,
        stack: (error as Error)?.stack,
      });

      throw new Error('Error ocurred while logging in with external token');
    }
  }

  async logout(uosToken: AuthJwtPayload): Promise<void | Rejection> {
    // validate user in token
    const oidcSub = uosToken.user.oidcSub;

    if (!oidcSub) {
      return rejection('INVALID_USER');
    }

    try {
      // get and validate user form datasource
      const user = this.validateUser(
        await this.userDataSource.getByOIDCSub(oidcSub)
      );

      const client = await OpenIdClient.getInstance();
      await client.revoke(user.oidcAccessToken);

      return;
    } catch (error) {
      return rejection('Error ocurred while logging out', {
        error: (error as Error)?.message,
      });
    }
  }

  public async isExternalTokenValid(code: string): Promise<boolean> {
    // No need to check external token validity, because we check UOS JWT token
    return true;
  }

  private async getUserInstitutionId(userInfo: UserinfoResponse) {
    if (userInfo.organisation) {
      const institutions = await this.adminDataSource.getInstitutions({
        name: userInfo.organisation as string,
      });

      if (institutions.length === 1) {
        return institutions[0].id;
      }
    }

    return undefined;
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
      await this.userDataSource.update({
        ...user,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        email: userInfo.email,
        oidcAccessToken: tokenSet.access_token,
        oidcRefreshToken: tokenSet.refresh_token ?? '',
        oidcSub: userInfo.sub,
        oidcIssuer: client.issuer.metadata.issuer,
        department: userInfo.department as string,
        gender: userInfo.gender as string,
        user_title: userInfo.title as string,
        organisation: institutionId ?? user.organisation,
      });

      return user;
    } else {
      const newUser = await this.userDataSource.create(
        'unspecified',
        userInfo.given_name,
        undefined,
        userInfo.family_name,
        userInfo.email,
        '',
        userInfo.given_name,
        userInfo.sub,
        tokenSet.access_token,
        tokenSet.refresh_token ?? '',
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

  private validateUserProfile(userProfile: UserinfoResponse): ValidUserInfo {
    return {
      ...userProfile,
      email: userProfile.email ?? '',
      family_name: userProfile.family_name ?? '',
      given_name: userProfile.given_name ?? '',
    } as ValidUserInfo;
  }

  private validateTokenSet(tokenSet: TokenSet): ValidTokenSet {
    if (!tokenSet.access_token) {
      logger.logError('Invalid tokenSet', {
        authorizer: this.constructor.name,
        tokenSet,
      });
      throw new Error('Invalid tokenSet');
    }

    return tokenSet as ValidTokenSet;
  }

  private validateUser(user: User | null): ValidUser {
    if (!user?.oidcSub || !user?.oidcAccessToken) {
      logger.logError('Invalid user', {
        authorizer: this.constructor.name,
        user,
      });
      throw new Error('Invalid user');
    }

    return user as ValidUser;
  }
}
