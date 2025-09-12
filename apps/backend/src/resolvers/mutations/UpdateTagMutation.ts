import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Tag } from '../types/Tag';
import { CreateTagArgs } from './CreateTagMutation';

@ArgsType()
export class UpdateTagArgs extends CreateTagArgs {
  @Field(() => Int)
  public id: number;
}

@Resolver()
export class CreateTagMutation {
  @Mutation(() => Tag)
  async updateTag(
    @Args() args: UpdateTagArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.tag.updateTag(context.user, args);
  }
}
