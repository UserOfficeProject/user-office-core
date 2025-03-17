import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Facility } from '../../models/Facility';
import { Instrument } from '../../models/Instrument';
import { BasicUserDetails } from '../../models/User';
import { FacilityDataSource } from '../FacilityDataSource';
import { UserDataSource } from '../UserDataSource';
import database from './database';
import {
  createFacilityObject,
  createInstrumentObject,
  FacilityRecord,
  FacilityUserRecord,
  InstrumentRecord,
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

  async addUsersToFacility(
    userId: number[],
    facilityId: number
  ): Promise<boolean> {
    const dataToInsert = userId.map((userId) => ({
      facility_id: facilityId,
      user_id: userId,
    }));

    const result = await database('facility_user').insert(dataToInsert);

    return result.length > 0;
  }

  async removeUserFromFacility(
    userId: number,
    facilityId: number
  ): Promise<boolean> {
    const result = await database('facility_user')
      .where({ user_id: userId, facility_id: facilityId })
      .del();

    return result > 0;
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

  async getFacilityInstruments(facilityId: number): Promise<Instrument[]> {
    const instruments = await database<InstrumentRecord>(
      'facility_instrument as fi'
    )
      .join('instruments as i', 'fi.instrument_id', 'i.instrument_id')
      .where('facility_id', facilityId)
      .select('i.*');

    return instruments.map(createInstrumentObject);
  }

  async getFacilityUsers(facilityId: number): Promise<BasicUserDetails[]> {
    const users = await database<FacilityUserRecord>('facility_user')
      .where('facility_id', facilityId)
      .select('user_id');

    return await this.userDataSource.getBasicUsersInfo(
      users.map((user) => user.user_id)
    );
  }
}

export default PostgresFacilityDataSource;
