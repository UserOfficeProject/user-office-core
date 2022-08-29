import { logger } from '@user-office-software/duo-logger';
import jsonwebtoken, { Algorithm } from 'jsonwebtoken';
import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { User, UserRole } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

interface ExternalLoginJWT {
  scope: string;
  client_id: string;
  ORCID: string;
  mail: string;
  FirstName: string;
  subject: string;
  'pi.sri': string;
  LastName: string;
  exp: number;
}

@injectable()
export class LocalDBAuthorization extends UserAuthorization {
  private static PING_PUBLIC_CRT = process.env.PING_PUBLIC_CRT;
  private static PING_SIGNING_ALGORITHM: Algorithm = 'RS256';

  private decode(token: string) {
    if (!LocalDBAuthorization.PING_PUBLIC_CRT) {
      logger.logError('Environmental variable PING_PUBLIC_CRT is not defined', {
        crt: LocalDBAuthorization.PING_PUBLIC_CRT,
      });
      throw new Error('Authorization configuration error');
    }

    return jsonwebtoken.verify(token, LocalDBAuthorization.PING_PUBLIC_CRT, {
      algorithms: [LocalDBAuthorization.PING_SIGNING_ALGORITHM],
    }) as ExternalLoginJWT;
  }

  async externalTokenLogin(token: string): Promise<User | null> {
    const decoded = this.decode(token);

    const user = await this.userDataSource.getByOIDCSub(decoded.ORCID);
    if (user) {
      await this.userDataSource.update({
        ...user,
        firstname: decoded.FirstName,
        lastname: decoded.LastName,
        email: decoded.mail,
      });

      return user;
    } else {
      const newUser = await this.userDataSource.create(
        'unspecified',
        decoded.FirstName,
        undefined,
        decoded.LastName,
        decoded.mail,
        decoded.FirstName,
        undefined,
        decoded.ORCID,
        '',
        '',
        'male',
        1,
        new Date(),
        1,
        '',
        '',
        decoded.mail,
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

  async logout(): Promise<void> {
    // JWT tokens can not be invalidated
    return;
  }

  async isExternalTokenValid(token: string): Promise<boolean> {
    return this.decode(token) !== null;
  }
}
