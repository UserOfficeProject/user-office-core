import { injectable, inject } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import FacilityDataSource from '../datasources/postgres/FacilityDataSource';
import { Facility } from '../models/Facility';

@injectable()
export default class FacilityQueries {
  constructor(
    @inject(Tokens.FacilityDataSource)
    public dataSource: FacilityDataSource
  ) {}

  async getFacilities(ids: number[] | null): Promise<Facility[]> {
    return this.dataSource.getFacilities(ids);
  }

  // async getFacilityInstrumentIds(facilityId: number): Promise<number[]> {
  //   return this.dataSource.getFacilityInstruments(facilityId);
  // }
}
