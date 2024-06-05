import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { Authorized } from '../decorators';
import { Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { Technique } from '../models/Technique';
import { UserWithRole } from '../models/User';
import { TechniqueDataSource } from './../datasources/TechniqueDataSource';

@injectable()
export default class TechniqueMutations {
  constructor(
    @inject(Tokens.TechniqueDataSource)
    private dataSource: TechniqueDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  // @EventBus(Event.TECHNIQUE_CREATED)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null
    // args: CreateTechniqueArgs
  ): Promise<Technique | Rejection> {
    return new Rejection('not implemented');
    // return this.dataSource.create(args).catch((error) => {
    //   return rejection(
    //     'Could not create technique',
    //     { agent, shortCode: args.shortCode },
    //     error
    //   );
    // });
  }

  // @EventBus(Event.TECHNIQUE_UPDATED)
  // @ValidateArgs(updateTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null
    // args: UpdateInstrumentArgs
  ): Promise<Technique | Rejection> {
    return new Rejection('not implemented');

    // return this.dataSource.update(args).catch((error) => {
    //   return rejection(
    //     'Could not update technique',
    //     { agent, techniqueId: args.id },
    //     error
    //   );
    // });
  }

  // @EventBus(Event.TECHNIQUE_DELETED)
  // @ValidateArgs(deleteTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<Technique | Rejection> {
    return new Rejection('not implemented');

    // return this.dataSource.delete(args.id).catch((error) => {
    //   return rejection(
    //     'Could not delete technique',
    //     { agent, techniqueId: args.id },
    //     error
    //   );
    // });
  }

  // async assignInstrumentsToTechnique()
  // async removeInstrumentsFromTechnique()
}
