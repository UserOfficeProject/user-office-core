import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Tag } from '../types/Tag';

@ArgsType()
export class CreateTagArgs {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;
}

@Resolver()
export class CreateTagMutation {
  @Mutation(() => Tag)
  async createTag(
    @Args() args: CreateTagArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.tag.createTag(context.user, args);
  }
}
