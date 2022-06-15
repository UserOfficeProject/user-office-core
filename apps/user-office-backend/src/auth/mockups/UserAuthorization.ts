import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { dummyUser } from '../../datasources/mockups/UserDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { SEPDataSource } from '../../datasources/SEPDataSource';
import { UserDataSource } from '../../datasources/UserDataSource';
import { VisitDataSource } from '../../datasources/VisitDataSource';
import { User } from '../../models/User';
import { UserAuthorization } from '../UserAuthorization';

@injectable()
export class UserAuthorizationMock extends UserAuthorization {
  constructor(
    @inject(Tokens.UserDataSource) protected userDataSource: UserDataSource,
    @inject(Tokens.SEPDataSource) protected sepDataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource)
    protected proposalDataSource: ProposalDataSource,
    @inject(Tokens.VisitDataSource) protected visitDataSource: VisitDataSource
  ) {
    super(userDataSource, sepDataSource, proposalDataSource, visitDataSource);
  }

  async externalTokenLogin(token: string): Promise<User | null> {
    if (token === 'valid') {
      return dummyUser;
    }

    return null;
  }

  async logout(token: string): Promise<void> {
    return;
  }
  async isExternalTokenValid(externalToken: string): Promise<boolean> {
    return true;
  }
}
