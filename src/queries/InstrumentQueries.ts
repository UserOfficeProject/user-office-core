import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

export default class InstrumentQueries {
  constructor(
    public dataSource: InstrumentDataSource,
    private sepDataSource: SEPDataSource
  ) {}

  private isUserOfficer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  @Authorized()
  async get(agent: UserWithRole | null, instrumentId: number) {
    const instrument = await this.dataSource.get(instrumentId);

    return instrument;
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null, callIds: number[]) {
    if (!callIds || callIds.length === 0) {
      return await this.dataSource.getAll();
    } else {
      const instrumentsByCallIds = await this.dataSource.getInstrumentsByCallId(
        callIds
      );

      return {
        totalCount: instrumentsByCallIds.length,
        instruments: instrumentsByCallIds,
      };
    }
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
    Roles.SEP_REVIEWER,
  ])
  async getInstrumentsBySepId(
    agent: UserWithRole | null,
    { sepId, callId }: { sepId: number; callId: number }
  ) {
    if (
      this.isUserOfficer(agent) ||
      (await this.sepDataSource.isMemberOfSEP(agent, sepId))
    ) {
      const instruments = await this.dataSource.getInstrumentsBySepId(
        sepId,
        callId
      );

      return instruments;
    } else {
      return null;
    }
  }
}
