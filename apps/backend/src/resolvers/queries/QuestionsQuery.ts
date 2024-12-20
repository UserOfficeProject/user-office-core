import {
  Arg,
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

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

@InputType()
export class AllQuestionsFilter {
  @Field(() => TemplateCategoryId, { nullable: true })
  public category?: TemplateCategoryId;

  @Field(() => [DataType], { nullable: true })
  public dataType?: DataType[];
}

@ObjectType()
class AllQuestionsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [QuestionWithUsage])
  public questions: QuestionWithUsage[];
}

@ArgsType()
export class AllQuestionsFilterArgs {
  @Field(() => AllQuestionsFilter, { nullable: true })
  public filter?: AllQuestionsFilter;

  @Field(() => Int, { nullable: true })
  public first?: number;

  @Field(() => Int, { nullable: true })
  public offset?: number;

  @Field({ nullable: true })
  public sortField?: string;

  @Field({ nullable: true })
  public sortDirection?: string;

  @Field({ nullable: true })
  public searchText?: string;
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

  @Query(() => AllQuestionsQueryResult)
  allQuestions(
    @Args() args: AllQuestionsFilterArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.template.getAllQuestions(context.user, args);
  }
}
