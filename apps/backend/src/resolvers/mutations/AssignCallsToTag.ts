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
export class AssignCallsToTagArgs {
  @Field(() => [Int])
  public callIds: number[];

  @Field(() => Int)
  public tagId: number;
}

@ArgsType()
export class RemoveCallFromTagArgs {
  @Field(() => Int)
  public callId: number;

  @Field(() => Int)
  public tagId: number;
}

@Resolver()
export class AssignCallsToTagMutation {
  @Mutation(() => Boolean)
  async assignCallsToTag(
    @Args() args: AssignCallsToTagArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.tag.addCallsToTag(context.user, args);
  }

  @Mutation(() => Boolean)
  async removeCallFromTag(
    @Args() args: RemoveCallFromTagArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.tag.removeCallFromTag(context.user, args);
  }
}
