import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import UOWSSoapClient from '../datasources/stfc/UOWSSoapInterface';
import { UserDataSource } from '../datasources/UserDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { User } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

const client = new UOWSSoapClient(process.env.EXTERNAL_AUTH_SERVICE_URL);

@injectable()
export class StfcUserAuthorization extends UserAuthorization {
  constructor(
    @inject(Tokens.UserDataSource) protected userDataSource: UserDataSource,
    @inject(Tokens.SEPDataSource) protected sepDataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource)
    protected proposalDataSource: ProposalDataSource,
    @inject(Tokens.VisitDataSource) protected visitDataSource: VisitDataSource
  ) {
    super(userDataSource, sepDataSource, proposalDataSource, visitDataSource);
  }
  async externalTokenLogin(token: string): Promise<User> {
    const stfcUser = await client
      .getPersonDetailsFromSessionId(token)
      .then((rawStfcUser) => rawStfcUser.return)
      .catch((error) => {
        const rethrowMessage =
          'Failed to fetch user details for STFC external authentication';
        logger.logWarn(rethrowMessage, {
          cause: error,
          token: token,
        });

        throw rethrowMessage;
      });

    // Create dummy user if one does not exist in the proposals DB.
    // This is needed to satisfy the FOREIGN_KEY constraints
    // in tables that link to a user (such as proposals)
    const userNumber = parseInt(stfcUser.userNumber);
    const dummyUser = await this.userDataSource.ensureDummyUserExists(
      userNumber
    );

    // With dummyUser created and written (ensureDummyUserExists), info can now
    // be added to it without persisting it to the database, which is not wanted.
    // This info is used in the userContext.
    dummyUser.email = stfcUser.email;
    dummyUser.firstname = stfcUser.givenName;
    dummyUser.preferredname = stfcUser.firstNameKnownAs;
    dummyUser.lastname = stfcUser.familyName;

    return dummyUser;
  }

  async logout(token: string): Promise<void> {
    await client.logout(token).catch(() => {
      logger.logWarn('Failed to log out user', { token });
      throw new Error(`Failed to logout ${token}`);
    });

    return;
  }

  async isExternalTokenValid(token: string): Promise<boolean> {
    const result = await client.isTokenValid(token);

    return result.return;
  }
}
