import DataLoader from 'dataloader';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UserDataSource } from '../datasources/UserDataSource';

@injectable()
export default class BasicUserDetailsLoader {
  constructor(
    @inject(Tokens.UserDataSource) private userDataSource: UserDataSource
  ) {}
  batchLoader = new DataLoader(
    async (keys: readonly number[]) => {
      const usersList = await this.userDataSource.getBasicUsersInfo(keys);
      const result = keys.map((id) => {
        return usersList?.find((user) => user.id === id);
      });

      return result;
    },
    { cache: false }
  );
}
