import 'reflect-metadata';

import { logger } from '@user-office-software/duo-logger';
import { OpenIdClient } from '@user-office-software/openid';
import { ValidTokenSet } from '@user-office-software/openid/lib/model/ValidTokenSet';
import { ValidUserInfo } from '@user-office-software/openid/lib/model/ValidUserInfo';
import { GraphQLError } from 'graphql';

import { OAuthAuthorization } from './OAuthAuthorization';
import { User, UserRole } from '../models/User';
import { GetOrCreateInstitutionInput } from '../resolvers/mutations/UpsertUserMutation';

export class DlsUserAuthorization extends OAuthAuthorization {
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

      const user = await this.upsertUserDLS(userProfile, tokenSet);

      return user;
    } catch (error) {
      logger.logError('Error ocurred while logging in with external token', {
        error: (error as Error)?.message,
        stack: (error as Error)?.stack,
      });

      throw new Error(error as string);
    }
  }

  private async upsertUserDLS(
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
    const userId = this.getUniqueId(userInfo);
    const userWithOAuthSubMatch =
      await this.userDataSource.getByOIDCSub(userId);

    const userWithEmailMatch = await this.userDataSource.getByEmail(
      userInfo.email
    );

    const user = userWithOAuthSubMatch ?? userWithEmailMatch;

    if (user) {
      const updatedUser = await this.userDataSource.update({
        ...user,
        email: userInfo.email,
        oauthIssuer: client.issuer.metadata.issuer,
        oauthRefreshToken: tokenSet.refresh_token ?? '',
        oidcSub: userId,
      });

      return updatedUser;
    } else {
      const newUser = await this.userDataSource.create(
        (userInfo.title as string) ?? 'unspecified',
        userInfo.given_name,
        userInfo.family_name,
        userInfo.given_name ?? '',
        userId,
        tokenSet.refresh_token ?? '',
        client.issuer.metadata.issuer,
        institution?.id ?? 1,
        userInfo.email
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
}
