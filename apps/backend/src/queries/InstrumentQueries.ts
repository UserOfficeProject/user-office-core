import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { Authorized } from '../decorators';
import { Instrument } from '../models/Instrument';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class InstrumentQueries {
  constructor(
    @inject(Tokens.InstrumentDataSource)
    public dataSource: InstrumentDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization
  ) {}

  private isUserOfficer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  @Authorized()
  async get(agent: UserWithRole | null, instrumentId: number) {
    const instrument = await this.dataSource.getInstrument(instrumentId);

    return instrument;
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.SEP_REVIEWER,
    Roles.SEP_CHAIR,
    Roles.SEP_SECRETARY,
  ])
  async getAll(agent: UserWithRole | null, callIds: number[]) {
    if (!callIds || callIds.length === 0) {
      return await this.dataSource.getInstruments();
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
      return this.dataSource.getInstruments();
    }

    const instruments = await this.dataSource.getUserInstruments(agent!.id);

    return { totalCount: instruments.length, instruments };
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async getInstrumentsBySepId(
    agent: UserWithRole | null,
    { sepId, callId }: { sepId: number; callId: number }
  ) {
    if (
      this.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfSEP(agent, sepId))
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

  @Authorized()
  async hasInstrumentScientistInstrument(
    agent: UserWithRole | null,
    instrumentId: number
  ) {
    return this.dataSource.hasInstrumentScientistInstrument(
      agent?.id as number,
      instrumentId
    );
  }

  @Authorized()
  async hasInstrumentScientistAccess(
    agent: UserWithRole | null,
    instrumentId: number,
    proposalPk: number
  ) {
    return this.dataSource.hasInstrumentScientistAccess(
      agent?.id as number,
      instrumentId,
      proposalPk
    );
  }

  @Authorized()
  async byRef(agent: UserWithRole | null, id: number) {
    return this.dataSource.getInstrument(id);
  }
}
