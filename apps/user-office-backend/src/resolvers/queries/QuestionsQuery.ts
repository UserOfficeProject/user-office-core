import { Arg, Ctx, Field, InputType, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { DataType, TemplateCategoryId } from '../../models/Template';
import { QuestionWithUsage } from '../types/QuestionWithUsage';

@InputType()
export class QuestionsFilter {
  @Field(() => String, { nullable: true })
  public text?: string;

  @Field(() => TemplateCategoryId, { nullable: true })
  public category?: TemplateCategoryId;

  @Field(() => [DataType], { nullable: true })
  public dataType?: DataType[];

  @Field(() => [DataType], { nullable: true })
  public excludeDataType?: DataType[];

  @Field(() => [String], { nullable: true })
  public questionIds?: string[];
}

@Resolver()
export class QuestionsQuery {
  @Query(() => [QuestionWithUsage])
  questions(
    @Arg('filter', () => QuestionsFilter, { nullable: true })
    filter: QuestionsFilter | undefined,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.getQuestions(context.user, filter);
  }
}
