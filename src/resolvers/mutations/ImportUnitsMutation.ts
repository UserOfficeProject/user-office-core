import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ConflictResolution } from '../types/ConflictResolution';
import { wrapResponse } from '../wrapResponse';
import { UnitsResponseWrap } from './../types/CommonWrappers';

@ArgsType()
export class ImportUnitsArgs {
  @Field(() => String)
  public json: string;

  @Field(() => [ConflictResolution])
  public conflictResolutions: ConflictResolution[];
}

@Resolver()
export class ImportUnitsMutation {
  @Mutation(() => UnitsResponseWrap)
  importUnits(@Args() args: ImportUnitsArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.unit.importUnits(context.user, args),
      UnitsResponseWrap
    );
  }
}
