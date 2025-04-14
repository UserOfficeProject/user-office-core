import { Facility } from '../../models/Facility';
import { Instrument } from '../../models/Instrument';
import { BasicUserDetails } from '../../models/User';
import { FacilityDataSource } from '../FacilityDataSource';

export class FacilityDataSourceMock implements FacilityDataSource {
  getFacilities(ids: number[] | null): Promise<Facility[]> {
    throw new Error('Method not implemented.');
  }
  createFacility(name: string, shortCode: string): Promise<Facility> {
    throw new Error('Method not implemented.');
  }
  updateFacility(
    id: number,
    name: string,
    shortCode: string
  ): Promise<Facility> {
    throw new Error('Method not implemented.');
  }
  deleteFacility(id: number): Promise<Facility> {
    throw new Error('Method not implemented.');
  }
  addUsersToFacility(userIds: number[], facilityId: number): Promise<boolean> {
    return Promise.resolve(true);
  }
  removeUserFromFacility(userId: number, facilityId: number): Promise<boolean> {
    return Promise.resolve(true);
  }
  addInstrumentsToFacility(
    instrumentIds: number[],
    facilityId: number
  ): Promise<boolean> {
    return Promise.resolve(true);
  }
  removeInstrumentFromFacility(
    instrumentId: number,
    facilityId: number
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getFacilityInstruments(facilityId: number): Promise<Instrument[]> {
    throw new Error('Method not implemented.');
  }
  getFacilityUsers(facilityId: number): Promise<BasicUserDetails[]> {
    throw new Error('Method not implemented.');
  }
  getUsersFacilities(userId: number): Promise<Facility[]> {
    return Promise.resolve([new Facility(0, 'ISIS Facility', 'ISIS')]);
  }
  isProposalOnUsersFacility(user: number, proposal: number): Promise<boolean> {
    return Promise.resolve(true);
  }
  getFacilitiesByNames(facilityNames: string[]): Promise<Facility[]> {
    return Promise.resolve([new Facility(0, 'ISIS Facility', 'ISIS')]);
  }
}
