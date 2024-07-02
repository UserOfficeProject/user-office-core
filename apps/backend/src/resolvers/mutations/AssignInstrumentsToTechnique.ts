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
export class AssignInstrumentsToTechniqueArgs {
  @Field(() => [Int])
  public instrumentIds: number[];

  @Field(() => Int)
  public techniqueId: number;
}

@Resolver()
export class AssignInstrumentsToTechniqueMutation {
  @Mutation(() => Boolean)
  async assignInstrumentsToTechnique(
    @Args() args: AssignInstrumentsToTechniqueArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.assignInstrumentsToTechnique(
      context.user,
      args
    );
  }
}
