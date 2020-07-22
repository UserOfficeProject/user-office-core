import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Response } from '../Decorators';
import { ResponseWrapBase } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ObjectType()
class UpdateTopicOrderResponseWrap extends ResponseWrapBase<number[]> {
  @Response()
  @Field(() => [Int], { nullable: true })
  public topicOrder: number[];
}

@Resolver()
export class UpdateTopicOrderMutation {
  @Mutation(() => UpdateTopicOrderResponseWrap)
  updateTopicOrder(
    @Arg('topicOrder', () => [Int]) topicOrder: number[],
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.updateTopicOrder(context.user, { topicOrder }),
      UpdateTopicOrderResponseWrap
    );
  }
}
