import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { TechniqueDataSource } from '../datasources/TechniqueDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class TechniqueQueries {
  constructor(
    @inject(Tokens.TechniqueDataSource)
    public dataSource: TechniqueDataSource,
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
  async get(agent: UserWithRole | null, techniqueId: number) {
    const technique = await this.dataSource.getTechnique(techniqueId);

    return technique;
  }

  @Authorized()
  async getInstrumentsByTechniqueId(
    agent: UserWithRole | null,
    techniqueId: number
  ) {
    return await this.dataSource.getInstrumentsByTechniqueId(techniqueId);
  }

  @Authorized([
    Roles.USER_OFFICER,
    Roles.FAP_REVIEWER,
    Roles.FAP_CHAIR,
    Roles.FAP_SECRETARY,
  ])
  async getAll(agent: UserWithRole | null) {
    return await this.dataSource.getTechniques();
  }

  @Authorized()
  async byRef(agent: UserWithRole | null, id: number) {
    return this.dataSource.getTechnique(id);
  }
}
