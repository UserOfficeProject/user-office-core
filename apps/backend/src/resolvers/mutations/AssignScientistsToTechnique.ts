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
export class AssignScientistsToTechniqueArgs {
  @Field(() => [Int])
  public scientistIds: number[];

  @Field(() => Int)
  public techniqueId: number;
}

@ArgsType()
export class RemoveScientistFromTechniqueArgs {
  @Field(() => Int)
  public scientistId: number;

  @Field(() => Int)
  public techniqueId: number;
}

@Resolver()
export class AssignScientistsToTechniqueMutation {
  @Mutation(() => Boolean)
  async assignScientistsToTechnique(
    @Args() args: AssignScientistsToTechniqueArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.assignScientistsToTechnique(
      context.user,
      args
    );
  }

  @Mutation(() => Boolean)
  async removeScientistFromTechnique(
    @Args() args: RemoveScientistFromTechniqueArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.removeScientistFromTechnique(
      context.user,
      args
    );
  }
}
