import { AdminDataSource } from '../datasources/AdminDataSource';

export default class AdminQueries {
  constructor(private dataSource: AdminDataSource) {}

  async getPageText(id: number): Promise<string | null> {
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
