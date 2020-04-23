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
  public templateId: number;

  @Field(() => Int)
  public topicId: number;

  @Field(() => [String], { nullable: true })
  public fieldIds: string[];
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
        topicId: args.topicId,
        fieldIds: args.fieldIds,
        templateId: args.templateId,
      }),
      UpdateFieldTopicRelResponseWrap
    );
  }
}
