import {
  assignInstrumentsToTechniqueValidationSchema,
  createTechniqueValidationSchema,
  deleteTechniqueValidationSchema,
  removeInstrumentsFromTechniqueValidationSchema,
  updateTechniqueValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Rejection, rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { Technique } from '../models/Technique';
import { UserWithRole } from '../models/User';
import { AssignInstrumentsToTechniqueArgs } from '../resolvers/mutations/AssignInstrumentsToTechnique';
import { CreateTechniqueArgs } from '../resolvers/mutations/CreateTechniqueMutation';
import { RemoveInstrumentFromTechniqueArgs } from '../resolvers/mutations/RemoveInstrumentFromTechnique';
import { UpdateTechniqueArgs } from '../resolvers/mutations/UpdateTechniqueMutations';
import { TechniqueDataSource } from './../datasources/TechniqueDataSource';

@injectable()
export default class TechniqueMutations {
  constructor(
    @inject(Tokens.TechniqueDataSource)
    private dataSource: TechniqueDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @EventBus(Event.TECHNIQUE_CREATED)
  @ValidateArgs(createTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    args: CreateTechniqueArgs
  ): Promise<Technique | Rejection> {
    const technique = await this.dataSource.create(args).catch((error) => {
      return rejection(
        'Could not create technique',
        { agent, shortCode: args.shortCode },
        error
      );
    });

    return technique;
  }

  @EventBus(Event.TECHNIQUE_UPDATED)
  @ValidateArgs(updateTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: UpdateTechniqueArgs
  ): Promise<Technique | Rejection> {
    const updatedTechnique = await this.dataSource
      .update(args)
      .catch((error) => {
        return rejection(
          'Could not update technique',
          { agent, techniqueId: args.techniqueId },
          error
        );
      });

    return updatedTechnique;
  }

  @EventBus(Event.TECHNIQUE_DELETED)
  @ValidateArgs(deleteTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    args: { techniqueId: number }
  ): Promise<Technique | Rejection> {
    const deletedTechnique = await this.dataSource
      .delete(args.techniqueId)
      .catch((error) => {
        return rejection(
          'Could not delete technique',
          { agent, techniqueId: args.techniqueId },
          error
        );
      });

    return deletedTechnique;
  }

  @EventBus(Event.INSTRUMENT_ASSIGNED_TO_TECHNIQUE)
  @ValidateArgs(assignInstrumentsToTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignInstrumentsToTechnique(
    agent: UserWithRole | null,
    args: AssignInstrumentsToTechniqueArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .assignInstrumentsToTechnique(args.instrumentIds, args.techniqueId)
      .catch((error) => {
        return rejection(
          'Could not assign instruments to technique',
          { agent, args },
          error
        );
      });
  }

  @EventBus(Event.INSTRUMENT_REMOVED_FROM_TECHNIQUE)
  @ValidateArgs(removeInstrumentsFromTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeInstrumentFromTechnique(
    agent: UserWithRole | null,
    args: RemoveInstrumentFromTechniqueArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeInstrumentFromTechnique(args.instrumentId, args.techniqueId)
      .catch((error) => {
        return rejection(
          'Could not remove assigned instrument from technique',
          { agent, args },
          error
        );
      });
  }
}
