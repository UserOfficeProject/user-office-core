import { logger } from '@user-office-software/duo-logger';
import DataLoader from 'dataloader';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UserDataSource } from '../datasources/UserDataSource';

@injectable()
export default class UsersLoader {
  constructor(
    @inject(Tokens.UserDataSource) private userDataSource: UserDataSource
  ) {}
  batchLoader = new DataLoader(async (keys: readonly number[]) => {
    logger.logInfo(
      `Inside batch loading function fetching the user details for user id(s)  ${keys}`,
      {}
    );

    const usersList = await this.userDataSource.getUsersByUserNumbers(keys);
    const result = keys.map((id) => {
      return usersList?.find((user) => user.id === id);
    });

    return result;
  });
}
