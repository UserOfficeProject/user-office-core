import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Float,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TopicResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateTopicArgs {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => Float, { nullable: true })
  sortOrder: number;

  @Field(() => Boolean, { nullable: true })
  isEnabled: boolean;
}

@Resolver()
export class UpdateTopicMutation {
  @Mutation(() => TopicResponseWrap)
  updateTopic(@Args() args: UpdateTopicArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.template.updateTopic(context.user, args),
      TopicResponseWrap
    );
  }
}
