import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { User } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class EmailAsExternalTokenAuthorization extends UserAuthorization {
  async externalTokenLogin(token: string): Promise<User | null> {
    return this.userDataSource.getByEmail(token);
  }

  async logout(): Promise<void> {
    return;
  }

  async isExternalTokenValid(token: string): Promise<boolean> {
    const user = await this.userDataSource.getByEmail(token);

    return user !== null;
  }
}
