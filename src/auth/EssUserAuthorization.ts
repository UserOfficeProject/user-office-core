import { logger } from '@user-office-software/duo-logger';
import jsonwebtoken, { Algorithm } from 'jsonwebtoken';
import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
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
export class EssUserAuthorization extends UserAuthorization {
  private static PING_PUBLIC_CRT = process.env.PING_PUBLIC_CRT;
  private static PING_SIGNING_ALGORITHM: Algorithm = 'RS256';
  constructor(
    @inject(Tokens.UserDataSource) protected userDataSource: UserDataSource,
    @inject(Tokens.SEPDataSource) protected sepDataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource)
    protected proposalDataSource: ProposalDataSource,
    @inject(Tokens.VisitDataSource) protected visitDataSource: VisitDataSource
  ) {
    super(userDataSource, sepDataSource, proposalDataSource, visitDataSource);
  }

  private decode(token: string) {
    if (!EssUserAuthorization.PING_PUBLIC_CRT) {
      logger.logError('Environmental variable PING_PUBLIC_CRT is not defined', {
        crt: EssUserAuthorization.PING_PUBLIC_CRT,
      });
      throw new Error('Authorization configuration error');
    }

    return jsonwebtoken.verify(token, EssUserAuthorization.PING_PUBLIC_CRT, {
      algorithms: [EssUserAuthorization.PING_SIGNING_ALGORITHM],
    }) as ExternalLoginJWT;
  }

  async externalTokenLogin(token: string): Promise<User | null> {
    const decoded = this.decode(token);

    const user = await this.userDataSource.getByOrcID(decoded.ORCID);
    if (user) {
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
