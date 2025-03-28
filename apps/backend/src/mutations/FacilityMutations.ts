import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FacilityDataSource } from '../datasources/FacilityDataSource';
import { Authorized } from '../decorators';
import { Facility } from '../models/Facility';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import {
  AssignInstrumentsToFacilityArgs,
  RemoveInstrumentFromFacilityArgs,
} from '../resolvers/mutations/AssignInstrumentsToFacility';
import {
  AssignUsersToFacilityArgs,
  RemoveScientistFromFacilityArgs,
} from '../resolvers/mutations/AssignUsersToFacility';

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
  async addUserToFacility(
    agent: UserWithRole | null,
    args: AssignUsersToFacilityArgs
  ): Promise<boolean> {
    return this.dataSource.addUsersToFacility(args.userIds, args.facilityId);
  }

  @Authorized([Roles.USER_OFFICER])
  async removeUserFromFacility(
    agent: UserWithRole | null,
    args: RemoveScientistFromFacilityArgs
  ): Promise<boolean> {
    return this.dataSource.removeUserFromFacility(args.userId, args.facilityId);
  }
}
