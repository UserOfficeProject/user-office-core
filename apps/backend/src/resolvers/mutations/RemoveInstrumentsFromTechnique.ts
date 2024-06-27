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
export class RemoveInstrumentsFromTechniqueArgs {
  @Field(() => [Int])
  public instrumentIds: number[];

  @Field(() => Int)
  public techniqueId: number;
}

@Resolver()
export class RemoveInstrumentsFromTechnique {
  @Mutation(() => Boolean)
  async removeInstrumentsFromTechnique(
    @Args() args: RemoveInstrumentsFromTechniqueArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.removeInstrumentsFromTechnique(
      context.user,
      args
    );
  }
}
