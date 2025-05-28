import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Facility } from '../../models/Facility';
import { Instrument } from '../../models/Instrument';
import { ProposalView } from '../../models/ProposalView';
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
  ProposalViewRecord,
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

  async getUsersProposalsByFacility(
    userId: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    return await database<ProposalViewRecord>('facility_user as fu')
      .join('facility_instrument as fi', function () {
        this.on('fu.facility_id', '=', 'fi.facility_id').andOn(
          'fu.user_id',
          '=',
          userId.toString()
        ); // Apply the user_id condition here so hopefully we don't make a big joined table
      })
      .join(
        'instrument_has_proposals as ihp',
        'ihp.instrument_id',
        '=',
        'fi.instrument_id'
      )
      .join(
        'proposal_table_view as ptv',
        'ptv.proposal_pk',
        '=',
        'ihp.proposal_pk'
      )
      .select('ptv.*');
  }

  async getUsersFacilities(userId: number): Promise<Facility[]> {
    const facilities = await database<FacilityRecord>('facility_user as fu')
      .join('facility as f', 'fu.facility_id', '=', 'f.facility_id')
      .where('fu.user_id', userId)
      .select('f.*');

    return facilities.map(createFacilityObject);
  }

  async isProposalOnUsersFacility(
    user: number,
    proposal: number
  ): Promise<boolean> {
    const result = await database('facility_user as fu')
      .join(
        'facility_instrument as fi',
        'fu.facility_id',
        '=',
        'fi.facility_id'
      )
      .join(
        'instrument_has_proposals as ihp',
        'ihp.instrument_id',
        '=',
        'fi.instrument_id'
      )
      .where({
        'fu.user_id': user,
        'ihp.proposal_pk': proposal,
      })
      .first();

    return !!result;
  }

  async getFacilitiesByNames(facilityNames: string[]): Promise<Facility[]> {
    const facilities = await database<FacilityRecord>('facility')
      .whereIn('short_code', facilityNames)
      .select('*');

    return facilities.map(createFacilityObject);
  }
}

export default PostgresFacilityDataSource;
