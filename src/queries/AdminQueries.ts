import { AdminDataSource } from "../datasources/AdminDataSource";
import { UserAuthorization } from "../utils/UserAuthorization";

export default class AdminQueries {
  constructor(
    private dataSource: AdminDataSource,
    private userAuth: UserAuthorization
  ) {}

  async getPageText(id: number): Promise<String | null> {
    return await this.dataSource.get(id);
  }

  async getNationalities() {
    return await this.dataSource.getNationalities();
  }
  async getCountries() {
    return await this.dataSource.getCountries();
  }
  async getInstitutions() {
    return await this.dataSource.getInstitutions();
  }

  async getInstitution(id: number) {
    return await this.dataSource.getInstitution(id);
  }
}
