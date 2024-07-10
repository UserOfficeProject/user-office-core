import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TechniqueDataSource } from '../datasources/TechniqueDataSource';
import { Authorized } from '../decorators';
import { rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class TechniqueQueries {
  constructor(
    @inject(Tokens.TechniqueDataSource)
    public dataSource: TechniqueDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async get(agent: UserWithRole | null, techniqueId: number) {
    const technique = await this.dataSource
      .getTechnique(techniqueId)
      .catch((error) => {
        return rejection(
          'Could not get technique',
          { agent, techniqueId: techniqueId },
          error
        );
      });

    return technique;
  }

  @Authorized([Roles.USER_OFFICER])
  async getInstrumentsByTechniqueId(
    agent: UserWithRole | null,
    techniqueId: number
  ) {
    return await this.dataSource
      .getInstrumentsByTechniqueIds(Array.from([techniqueId]))
      .catch((error) => {
        return rejection(
          'Could not get instruments by technique ID',
          { agent, techniqueId: techniqueId },
          error
        );
      });
  }

  @Authorized([Roles.USER_OFFICER])
  async getAll(agent: UserWithRole | null) {
    return await this.dataSource.getTechniques().catch((error) => {
      return rejection('Could not get all techniques', { agent }, error);
    });
  }

  @Authorized()
  async getTechniquesByIds(agent: UserWithRole | null, techniqueIds: number[]) {
    return await this.dataSource.getTechniquesByIds(techniqueIds);
  }
}
