import { logger } from '@user-office-software/duo-logger';
import DataLoader from 'dataloader';
import { autoInjectable, container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UserDataSource } from '../datasources/UserDataSource';

@autoInjectable()
export default class UsersLoader {
  batchLoader = new DataLoader(async (keys: readonly number[]) => {
    const userDataSource = container.resolve<UserDataSource>(
      Tokens.UserDataSource
    );
    logger.logInfo(
      `Inside batch loading function fetching the user details for user id(s)  ${keys}`,
      {}
    );

    const usersList = await userDataSource.getUsersByUserNumbers(keys);
    const result = keys.map((id) => {
      return usersList?.find((user) => user.id === id);
    });

    return Promise.resolve(result);
  });
}
