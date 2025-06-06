import { Call } from '../models/Call';
import { Facility } from '../models/Facility';
import { Instrument } from '../models/Instrument';

export interface FacilityDataSource {
  getFacilities(ids: number[] | null): Promise<Facility[]>;
  createFacility(name: string, shortCode: string): Promise<Facility>;
  updateFacility(
    id: number,
    name: string,
    shortCode: string
  ): Promise<Facility>;
  deleteFacility(id: number): Promise<Facility>;
  addInstrumentsToFacility(
    instrumentIds: number[],
    facilityId: number
  ): Promise<boolean>;
  removeInstrumentFromFacility(
    instrumentId: number,
    facilityId: number
  ): Promise<boolean>;
  addCallsToFacility(callIds: number[], facilityId: number): Promise<boolean>;
  removeCallFromFacility(callId: number, facilityId: number): Promise<boolean>;
  getFacilityInstruments(facilityId: number): Promise<Instrument[]>;
  getFacilityCalls(facilityId: number): Promise<Call[]>;
  getFacilitiesByNames(facilityNames: string[]): Promise<Facility[]>;
  getCallsFacilities(callId: number | null): Promise<Facility[]>;
  getInstrumentsFacilities(instrumentId: number | null): Promise<Facility[]>;
}
