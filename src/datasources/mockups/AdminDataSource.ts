import { Page } from '../../models/Admin';
import { Institution } from '../../models/Institution';
import { AdminDataSource, Entry } from '../AdminDataSource';

export const dummyInstitution = new Institution(1, 'ESS', true);

export class AdminDataSourceMock implements AdminDataSource {
  async getInstitution(
    id: number
  ): Promise<import('../../models/Institution').Institution | null> {
    return dummyInstitution;
  }
  async createInstitution(
    institution: import('../../models/Institution').Institution
  ): Promise<import('../../models/Institution').Institution | null> {
    return dummyInstitution;
  }

  async updateInstitution(
    institution: import('../../models/Institution').Institution
  ): Promise<import('../../models/Institution').Institution | null> {
    return dummyInstitution;
  }

  async deleteInstitution(
    id: number
  ): Promise<import('../../models/Institution').Institution> {
    return dummyInstitution;
  }

  async getInstitutions(
    filter?:
      | import('../../resolvers/queries/InstitutionsQuery').InstitutionsFilter
      | undefined
  ): Promise<import('../../models/Institution').Institution[]> {
    return [dummyInstitution];
  }
  applyPatches(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async resetDB(): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async getCountries(): Promise<Entry[]> {
    throw new Error('Method not implemented.');
  }
  async getNationalities(): Promise<Entry[]> {
    throw new Error('Method not implemented.');
  }
  async get(id: number): Promise<string | null> {
    return 'HELLO WORLD';
  }
  async setPageText(id: number, text: string) {
    return new Page(id, text);
  }
}
