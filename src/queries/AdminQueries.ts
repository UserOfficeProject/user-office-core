import { AdminDataSource } from "../datasources/AdminDataSource";
import { UserAuthorization } from "../utils/UserAuthorization";
import { User } from "../models/User";

export default class AdminQueries {
  constructor(
    private dataSource: AdminDataSource,
    private userAuth: UserAuthorization
  ) {}

  async getPageText(agent: User | null, id: number): Promise<String | null> {
    if (agent == null) {
      return null;
    }
    return await this.dataSource.get(id);
  }
}
