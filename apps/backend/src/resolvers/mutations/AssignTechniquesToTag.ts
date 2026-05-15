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
export class AssignTechniquesToTagArgs {
  @Field(() => [Int])
  public techniqueIds: number[];

  @Field(() => Int)
  public tagId: number;
}

@ArgsType()
export class RemoveTechniqueFromTagArgs {
  @Field(() => Int)
  public techniqueId: number;

  @Field(() => Int)
  public tagId: number;
}

@Resolver()
export class AssignTechniquesToTagMutation {
  @Mutation(() => Boolean)
  async assignCallsToTag(
    @Args() args: AssignTechniquesToTagArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.tag.addTechniquesToTag(context.user, args);
  }

  @Mutation(() => Boolean)
  async removeTechniqueFromTag(
    @Args() args: RemoveTechniqueFromTagArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.tag.removeTechniqueFromTag(context.user, args);
  }
}