import { Facility } from '../models/Facility';
import { Instrument } from '../models/Instrument';
import { BasicUserDetails } from '../models/User';

export interface FacilityDataSource {
  getFacilities(ids: number[] | null): Promise<Facility[]>;
  createFacility(name: string, shortCode: string): Promise<Facility>;
  updateFacility(
    id: number,
    name: string,
    shortCode: string
  ): Promise<Facility>;
  deleteFacility(id: number): Promise<Facility>;
  addUsersToFacility(userIds: number[], facilityId: number): Promise<boolean>;
  removeUserFromFacility(userId: number, facilityId: number): Promise<boolean>;
  addInstrumentsToFacility(
    instrumentIds: number[],
    facilityId: number
  ): Promise<boolean>;
  removeInstrumentFromFacility(
    instrumentId: number,
    facilityId: number
  ): Promise<boolean>;
  getFacilityInstruments(facilityId: number): Promise<Instrument[]>;
  getFacilityUsers(facilityId: number): Promise<BasicUserDetails[]>;
  getUsersFacilities(userId: number): Promise<Facility[]>;
  isProposalOnUsersFacility(user: number, proposal: number): Promise<boolean>;
}
