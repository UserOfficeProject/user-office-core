import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { dummyUser } from '../../datasources/mockups/UserDataSource';
import { Role } from '../../models/Role';
import { AuthJwtPayload, User } from '../../models/User';
import { UserAuthorization } from '../UserAuthorization';

@injectable()
export class UserAuthorizationMock extends UserAuthorization {
  async externalTokenLogin(
    token: string,
    _redirectUri: string
  ): Promise<User | null> {
    if (token === 'valid') {
      return dummyUser;
    }

    return null;
  }
  async isInternalUser(userId: number, currentRole: Role): Promise<boolean> {
    return true;
  }
  async logout(token: AuthJwtPayload): Promise<string> {
    return 'logged out';
  }
  async isExternalTokenValid(externalToken: string): Promise<boolean> {
    return true;
  }
}
