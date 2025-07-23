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
export class AssignInstrumentsToTagArgs {
  @Field(() => [Int])
  public instrumentIds: number[];

  @Field(() => Int)
  public tagId: number;
}

@ArgsType()
export class RemoveInstrumentFromTagArgs {
  @Field(() => Int)
  public instrumentId: number;

  @Field(() => Int)
  public tagId: number;
}

@Resolver()
export class AssignInstrumentsToTagMutation {
  @Mutation(() => Boolean)
  async assignInstrumentsToTag(
    @Args() args: AssignInstrumentsToTagArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.tag.addInstrumentsToTag(context.user, args);
  }

  @Mutation(() => Boolean)
  async removeInstrumentFromTag(
    @Args() args: RemoveInstrumentFromTagArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.tag.removeInstrumentFromTag(context.user, args);
  }
}
