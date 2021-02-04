import { Page } from '../../models/Admin';
import { Feature, FeatureId } from '../../models/Feature';
import { Institution } from '../../models/Institution';
import { Unit } from '../../models/Unit';
import { AdminDataSource, Entry } from '../AdminDataSource';

export const dummyInstitution = new Institution(1, 'ESS', true);
export const dummyUnit = new Unit(1, 'Second');

export class AdminDataSourceMock implements AdminDataSource {
  updateUnit(unit: Unit): Promise<Unit | null> {
    throw new Error('Method not implemented.');
  }
  async createUnit(unit: Unit): Promise<Unit | null> {
    return dummyUnit;
  }
  async deleteUnit(id: number): Promise<Unit> {
    return dummyUnit;
  }
  async getUnits(): Promise<Unit[]> {
    return [dummyUnit];
  }
  async getInstitutionUsers(
    id: number
  ): Promise<import('../../models/User').BasicUserDetails[]> {
    return [];
  }
  async getInstitution(id: number): Promise<Institution | null> {
    return dummyInstitution;
  }
  async createInstitution(
    institution: Institution
  ): Promise<import('../../models/Institution').Institution | null> {
    return dummyInstitution;
  }

  async updateInstitution(
    institution: Institution
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
  async getFeatures(): Promise<Feature[]> {
    return [{ id: FeatureId.SHIPPING, isEnabled: false, description: '' }];
  }
}
