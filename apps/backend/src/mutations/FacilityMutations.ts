import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FacilityDataSource } from '../datasources/FacilityDataSource';
import { Authorized } from '../decorators';
import { Facility } from '../models/Facility';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import {
  AssignCallsToFacilityArgs,
  RemoveCallFromFacilityArgs,
} from '../resolvers/mutations/AssignCallsToFacility';
import {
  AssignInstrumentsToFacilityArgs,
  RemoveInstrumentFromFacilityArgs,
} from '../resolvers/mutations/AssignInstrumentsToFacility';

@injectable()
export default class FacilityMutations {
  constructor(
    @inject(Tokens.FacilityDataSource)
    public dataSource: FacilityDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async createFacility(
    agent: UserWithRole | null,
    data: { name: string; shortCode: string }
  ): Promise<Facility> {
    return this.dataSource.createFacility(data.name, data.shortCode);
  }

  @Authorized([Roles.USER_OFFICER])
  async updateFacility(
    agent: UserWithRole | null,
    data: { id: number; name: string; shortCode: string }
  ): Promise<Facility | null> {
    return this.dataSource.updateFacility(data.id, data.name, data.shortCode);
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteFacility(
    agent: UserWithRole | null,
    id: number
  ): Promise<Facility> {
    return this.dataSource.deleteFacility(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async addInstrumentsToFacility(
    agent: UserWithRole | null,
    args: AssignInstrumentsToFacilityArgs
  ): Promise<boolean> {
    return this.dataSource.addInstrumentsToFacility(
      args.instrumentIds,
      args.facilityId
    );
  }

  @Authorized([Roles.USER_OFFICER])
  async removeInstrumentFromFacility(
    agent: UserWithRole | null,
    args: RemoveInstrumentFromFacilityArgs
  ): Promise<boolean> {
    return this.dataSource.removeInstrumentFromFacility(
      args.instrumentId,
      args.facilityId
    );
  }

  @Authorized([Roles.USER_OFFICER])
  async addCallsToFacility(
    agent: UserWithRole | null,
    args: AssignCallsToFacilityArgs
  ): Promise<boolean> {
    return this.dataSource.addCallsToFacility(args.callIds, args.facilityId);
  }

  @Authorized([Roles.USER_OFFICER])
  async removeCallFromFacility(
    agent: UserWithRole | null,
    args: RemoveCallFromFacilityArgs
  ): Promise<boolean> {
    return this.dataSource.removeCallFromFacility(args.callId, args.facilityId);
  }
}
