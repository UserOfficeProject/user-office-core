import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { Authorized } from '../decorators';
import { Instrument, InstrumentWithManagementTime } from '../models/Instrument';
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

  @Authorized()
  async get(agent: UserWithRole | null, instrumentId: number) {
    const instrument = await this.dataSource.getInstrument(instrumentId);

    return instrument;
  }

  @Authorized()
  async getInstrumentsByIds(
    agent: UserWithRole | null,
    instrumentIds: number[]
  ) {
    return await this.dataSource.getInstrumentsByIds(instrumentIds);
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.FAP_REVIEWER,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
    Roles.INSTRUMENT_SCIENTIST,
  ])
  async getAll(agent: UserWithRole | null, callIds: number[]) {
    if (!callIds || callIds.length === 0) {
      return await this.dataSource.getInstruments();
    } else {
      const instrumentsByCallIds =
        await this.dataSource.getInstrumentsByCallId(callIds);

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
    if (this.userAuth.isApiToken(agent) || this.userAuth.isUserOfficer(agent)) {
      return this.dataSource.getInstruments();
    }

    const instruments = await this.dataSource.getUserInstruments(agent!.id);

    return { totalCount: instruments.length, instruments };
  }

  @Authorized()
  async getInstrumentsByProposalPk(
    agent: UserWithRole | null,
    proposalPk: number
  ): Promise<InstrumentWithManagementTime[]> {
    const instruments =
      await this.dataSource.getInstrumentsByProposalPk(proposalPk);

    return instruments;
  }

  @Authorized([Roles.USER_OFFICER, Roles.FAP_CHAIR, Roles.FAP_SECRETARY])
  async getInstrumentsByFapId(
    agent: UserWithRole | null,
    { fapId, callId }: { fapId: number; callId: number }
  ) {
    if (
      this.userAuth.isApiToken(agent) ||
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isMemberOfFap(agent, fapId))
    ) {
      const instruments = await this.dataSource.getInstrumentsByFapId(
        fapId,
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
