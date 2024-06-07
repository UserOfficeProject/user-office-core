import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ArgsType()
export class RemoveInstrumentFromTechniqueArgs {
  @Field(() => Int)
  public instrumentId: number;

  @Field(() => Int)
  public techniqueId: number;
}

@Resolver()
export class RemoveInstrumentsFromTechnique {
  @Mutation(() => Boolean)
  async removeInstrumentFromTechnique(
    @Args() args: RemoveInstrumentFromTechniqueArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.removeInstrumentFromTechnique(
      context.user,
      args
    );
  }
}
