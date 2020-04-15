import {
  Args,
  ArgsType,
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

@ArgsType()
class UpdateFieldTopicRelArgs {
  @Field(() => Int)
  public topic_id: number;

  @Field(() => [String], { nullable: true })
  public field_ids: string[];
}

@ObjectType()
class UpdateFieldTopicRelResponseWrap extends ResponseWrapBase<string[]> {
  @Response()
  @Field(() => [String], { nullable: true })
  public result: string[];
}

@Resolver()
export class UpdateFieldTopicRelMutation {
  @Mutation(() => UpdateFieldTopicRelResponseWrap)
  updateFieldTopicRel(
    @Args() args: UpdateFieldTopicRelArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.updateFieldTopicRel(context.user, {
        topicId: args.topic_id,
        fieldIds: args.field_ids,
      }),
      UpdateFieldTopicRelResponseWrap
    );
  }
}
