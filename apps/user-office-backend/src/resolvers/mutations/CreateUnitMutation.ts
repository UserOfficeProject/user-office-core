import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Unit } from '../types/Unit';

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
  @Mutation(() => Unit)
  createUnit(@Args() args: CreateUnitArgs, @Ctx() context: ResolverContext) {
    return context.mutations.unit.createUnit(context.user, args);
  }
}
