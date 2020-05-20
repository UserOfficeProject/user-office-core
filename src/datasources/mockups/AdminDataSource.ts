import { Page } from '../../models/Admin';
import { AdminDataSource, Entry } from '../AdminDataSource';

export class AdminDataSourceMock implements AdminDataSource {
  applyPatches(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async resetDB(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  async getInstitution(id: number): Promise<string | null> {
    throw new Error('Method not implemented.');
  }
  async getInstitutions(): Promise<Entry[]> {
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
