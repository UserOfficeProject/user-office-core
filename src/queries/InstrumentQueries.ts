import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized } from '../decorators';
import { Instrument } from '../models/Instrument';
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

  @Authorized([Roles.USER_OFFICER, Roles.INSTRUMENT_SCIENTIST])
  async getUserInstruments(
    agent: UserWithRole | null
  ): Promise<{ totalCount: number; instruments: Instrument[] }> {
    if (this.isUserOfficer(agent)) {
      return this.dataSource.getAll();
    }

    const instruments = await this.dataSource.getUserInstruments(agent!.id);

    return { totalCount: instruments.length, instruments };
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

  @Authorized([Roles.INSTRUMENT_SCIENTIST])
  async hasInstrumentScientistInstrument(
    agent: UserWithRole | null,
    instrumentId: number
  ) {
    return this.dataSource.hasInstrumentScientistInstrument(
      agent?.id as number,
      instrumentId
    );
  }

  @Authorized([Roles.INSTRUMENT_SCIENTIST])
  async hasInstrumentScientistAccess(
    agent: UserWithRole | null,
    instrumentId: number,
    proposalId: number
  ) {
    return this.dataSource.hasInstrumentScientistAccess(
      agent?.id as number,
      instrumentId,
      proposalId
    );
  }

  @Authorized()
  async byRef(agent: UserWithRole | null, id: number) {
    return this.dataSource.get(id);
  }
}
