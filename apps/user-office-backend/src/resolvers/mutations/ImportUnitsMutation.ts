import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ConflictResolution } from '../types/ConflictResolution';
import { Unit } from '../types/Unit';

@ArgsType()
export class ImportUnitsArgs {
  @Field(() => String)
  public json: string;

  @Field(() => [ConflictResolution])
  public conflictResolutions: ConflictResolution[];
}

@Resolver()
export class ImportUnitsMutation {
  @Mutation(() => [Unit])
  importUnits(@Args() args: ImportUnitsArgs, @Ctx() context: ResolverContext) {
    return context.mutations.unit.importUnits(context.user, args);
  }
}
