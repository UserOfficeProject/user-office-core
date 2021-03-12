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
import { TemplateResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateQuestionTemplateRelationArgs {
  @Field()
  public questionId: string;

  @Field(() => Int)
  public templateId: number;

  @Field(() => Int, { nullable: true })
  public topicId?: number;

  @Field(() => Int)
  public sortOrder: number;

  @Field({ nullable: true })
  public config?: string;
}

@Resolver()
export class UpdateQuestionTemplateRelationMutation {
  @Mutation(() => TemplateResponseWrap)
  updateQuestionTemplateRelation(
    @Args() args: UpdateQuestionTemplateRelationArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.updateQuestionTemplateRelation(
        context.user,
        args
      ),
      TemplateResponseWrap
    );
  }
}
