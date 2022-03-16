import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { UnitResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateUnitArgs {
  @Field()
  id: string;

  @Field()
  unit: string;

  @Field()
  quantity: string;

  @Field()
  symbol: string;

  @Field()
  siConversionFormula: string;
}

@Resolver()
export class CreateUnitMutation {
  @Mutation(() => UnitResponseWrap)
  createUnit(@Args() args: CreateUnitArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.unit.createUnit(context.user, args),
      UnitResponseWrap
    );
  }
}
