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
class AssignQuestionsToTopicArgs {
  @Field(() => Int)
  public templateId: number;

  @Field(() => Int)
  public topicId: number;

  @Field(() => [String], { nullable: true })
  public questionIds: string[];
}

@ObjectType()
class AssignQuestionsToTopicResponseWrap extends ResponseWrapBase<string[]> {
  @Response()
  @Field(() => [String], { nullable: true })
  public result: string[];
}

@Resolver()
export class AssignQuestionsToTopicMutation {
  @Mutation(() => AssignQuestionsToTopicResponseWrap)
  assignQuestionsToTopic(
    @Args() args: AssignQuestionsToTopicArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.assignQuestionsToTopic(context.user, {
        topicId: args.topicId,
        questionIds: args.questionIds,
        templateId: args.templateId,
      }),
      AssignQuestionsToTopicResponseWrap
    );
  }
}
