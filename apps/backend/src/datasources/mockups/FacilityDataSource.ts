import { Call } from '../../models/Call';
import { Facility } from '../../models/Facility';
import { Instrument } from '../../models/Instrument';
import { FacilityDataSource } from '../FacilityDataSource';

export class FacilityDataSourceMock implements FacilityDataSource {
  async getCallsFacilities(callId: number | null): Promise<Facility[]> {
    return [];
  }
  getInstrumentsFacilities(instrumentId: number | null): Promise<Facility[]> {
    throw new Error('Method not implemented.');
  }
  addCallsToFacility(callIds: number[], facilityId: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  removeCallFromFacility(callId: number, facilityId: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getFacilityCalls(facilityId: number): Promise<Call[]> {
    throw new Error('Method not implemented.');
  }
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
  getFacilitiesByNames(facilityNames: string[]): Promise<Facility[]> {
    return Promise.resolve([new Facility(0, 'ISIS Facility', 'ISIS')]);
  }
}
