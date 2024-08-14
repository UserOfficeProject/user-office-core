import {
  assignInstrumentsToTechniqueValidationSchema,
  createTechniqueValidationSchema,
  deleteTechniqueValidationSchema,
  removeInstrumentsFromTechniqueValidationSchema,
  updateTechniqueValidationSchema,
  assignScientistsToTechniqueValidationSchema,
  removeScientistFromTechniqueValidationSchema,
} from '@user-office-software/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Rejection, rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { AssignProposalToTechniquesArgs, Technique } from '../models/Technique';
import { UserWithRole } from '../models/User';
import { AssignInstrumentsToTechniqueArgs } from '../resolvers/mutations/AssignInstrumentsToTechnique';
import {
  AssignScientistsToTechniqueArgs,
  RemoveScientistFromTechniqueArgs,
} from '../resolvers/mutations/AssignScientistsToTechnique';
import { CreateTechniqueArgs } from '../resolvers/mutations/CreateTechniqueMutation';
import { RemoveInstrumentsFromTechniqueArgs } from '../resolvers/mutations/RemoveInstrumentsFromTechnique';
import { UpdateTechniqueArgs } from '../resolvers/mutations/UpdateTechniqueMutations';
import { TechniqueDataSource } from './../datasources/TechniqueDataSource';

@injectable()
export default class TechniqueMutations {
  constructor(
    @inject(Tokens.TechniqueDataSource)
    private dataSource: TechniqueDataSource
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
        { agent, args: args },
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
          `Could not update technique: '${args.id}`,
          { agent, args: args },
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
    args: { id: number }
  ): Promise<Technique | Rejection> {
    const deletedTechnique = await this.dataSource
      .delete(args.id)
      .catch((error) => {
        return rejection(
          `Could not delete technique: '${args.id}'`,
          { agent, args: args },
          error
        );
      });

    return deletedTechnique;
  }

  @EventBus(Event.INSTRUMENTS_ASSIGNED_TO_TECHNIQUE)
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
          `Could not assign instruments to technique: '${args.techniqueId}`,
          { agent, args: args },
          error
        );
      });
  }

  @EventBus(Event.INSTRUMENTS_REMOVED_FROM_TECHNIQUE)
  @ValidateArgs(removeInstrumentsFromTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeInstrumentsFromTechnique(
    agent: UserWithRole | null,
    args: RemoveInstrumentsFromTechniqueArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeInstrumentsFromTechnique(args.instrumentIds, args.techniqueId)
      .catch((error) => {
        return rejection(
          `Could not remove assigned instruments from technique: '${args.techniqueId}`,
          { agent, args: args },
          error
        );
      });
  }

  @EventBus(Event.PROPOSAL_ASSIGNED_TO_TECHNIQUES)
  @Authorized([Roles.USER_OFFICER])
  async assignProposalToTechnique(
    agent: UserWithRole | null,
    args: AssignProposalToTechniquesArgs
  ) {
    return this.assignProposalToTechniquesInternal(agent, args);
  }

  @EventBus(Event.PROPOSAL_ASSIGNED_TO_TECHNIQUES)
  async assignProposalToTechniquesInternal(
    agent: UserWithRole | null,
    args: AssignProposalToTechniquesArgs
  ) {
    return this.dataSource
      .assignProposalToTechniques(args.proposalPk, args.techniqueIds)
      .catch((error) => {
        return rejection(
          `Could not assign proposal to techniques: '${args.techniqueIds}`,
          { agent, args: args },
          error
        );
      });
  }

  @ValidateArgs(assignScientistsToTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignScientistsToTechnique(
    agent: UserWithRole | null,
    args: AssignScientistsToTechniqueArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .assignScientistsToTechnique(args.scientistIds, args.techniqueId)
      .catch((error) => {
        return rejection(
          'Could not assign scientist/s to technique',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(removeScientistFromTechniqueValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeScientistFromTechnique(
    agent: UserWithRole | null,
    args: RemoveScientistFromTechniqueArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeScientistFromTechnique(args.scientistId, args.techniqueId)
      .catch((error) => {
        return rejection(
          'Could not remove assigned scientist/s from technique',
          { agent, args },
          error
        );
      });
  }
}
