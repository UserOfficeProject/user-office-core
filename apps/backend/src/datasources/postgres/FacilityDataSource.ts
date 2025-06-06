import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Call } from '../../models/Call';
import { Facility } from '../../models/Facility';
import { Instrument } from '../../models/Instrument';
import { FacilityDataSource } from '../FacilityDataSource';
import { UserDataSource } from '../UserDataSource';
import database from './database';
import {
  createFacilityObject,
  createInstrumentObject,
  FacilityRecord,
  InstrumentRecord,
  createCallObject,
} from './records';

@injectable()
class PostgresFacilityDataSource implements FacilityDataSource {
  constructor(
    @inject(Tokens.UserDataSource) private userDataSource: UserDataSource
  ) {}

  async getFacilities(ids: number[] | null): Promise<Facility[]> {
    const facilities: FacilityRecord[] = await database<FacilityRecord>(
      'facility'
    )
      .select('*')
      .modify((query) => {
        if (ids) query.whereIn('facility_id', ids);
      });

    return facilities.map(createFacilityObject);
  }

  async createFacility(name: string, shortCode: string): Promise<Facility> {
    const [facility] = await database<FacilityRecord>('facility')
      .insert({ name, short_code: shortCode })
      .returning('*');

    return createFacilityObject(facility);
  }

  async updateFacility(
    id: number,
    name: string,
    shortCode: string
  ): Promise<Facility> {
    const [facility] = await database<FacilityRecord>('facility')
      .where('facility_id', id)
      .update({ name, short_code: shortCode })
      .returning('*');

    return createFacilityObject(facility);
  }

  async deleteFacility(id: number): Promise<Facility> {
    const [facility] = await database<FacilityRecord>('facility')
      .where('facility_id', id)
      .del()
      .returning('*');

    return createFacilityObject(facility);
  }

  async addInstrumentsToFacility(
    instrumentIds: number[],
    facilityId: number
  ): Promise<boolean> {
    const dataToInsert = instrumentIds.map((instrumentId) => ({
      facility_id: facilityId,
      instrument_id: instrumentId,
    }));

    const result = await database('facility_instrument').insert(dataToInsert);

    return result.length > 0;
  }

  async removeInstrumentFromFacility(
    instrumentId: number,
    facilityId: number
  ): Promise<boolean> {
    const result = await database('facility_instrument')
      .where({ instrument_id: instrumentId, facility_id: facilityId })
      .del();

    return result > 0;
  }

  async addCallsToFacility(
    callIds: number[],
    facilityId: number
  ): Promise<boolean> {
    const dataToInsert = callIds.map((callId) => ({
      facility_id: facilityId,
      call_id: callId,
    }));

    const result = await database('facility_call').insert(dataToInsert);

    return result.length > 0;
  }
  async removeCallFromFacility(
    callId: number,
    facilityId: number
  ): Promise<boolean> {
    const result = await database('facility_call')
      .where({ call_id: callId, facility_id: facilityId })
      .del();

    return result > 0;
  }

  async getFacilityInstruments(facilityId: number): Promise<Instrument[]> {
    const instruments = await database<InstrumentRecord>(
      'facility_instrument as fi'
    )
      .join('instruments as i', 'fi.instrument_id', 'i.instrument_id')
      .where('facility_id', facilityId)
      .select('i.*');

    return instruments.map(createInstrumentObject);
  }

  async getFacilityCalls(facilityId: number): Promise<Call[]> {
    const calls = await database('facility_call as fc')
      .join('call as c', 'fc.call_id', 'c.call_id')
      .where('fc.facility_id', facilityId)
      .select('c.*');

    return calls.map(createCallObject);
  }

  async getFacilitiesByNames(facilityNames: string[]): Promise<Facility[]> {
    const facilities = await database<FacilityRecord>('facility')
      .whereIn('short_code', facilityNames)
      .select('*');

    return facilities.map(createFacilityObject);
  }

  async getCallsFacilities(callId: number | null): Promise<Facility[]> {
    const facilities: FacilityRecord[] = await database<FacilityRecord>(
      'facility_call as fc'
    )
      .join('facility as f', 'fc.facility_id', 'f.facility_id')
      .where('fc.call_id', callId)
      .select('f.*');

    return facilities.map(createFacilityObject);
  }

  async getInstrumentsFacilities(
    instrumentId: number | null
  ): Promise<Facility[]> {
    const facilities: FacilityRecord[] = await database<FacilityRecord>(
      'facility_instrument as fi'
    )
      .join('facility as f', 'fi.facility_id', 'f.facility_id')
      .where('fi.instrument_id', instrumentId)
      .select('f.*');

    return facilities.map(createFacilityObject);
  }
}

export default PostgresFacilityDataSource;
