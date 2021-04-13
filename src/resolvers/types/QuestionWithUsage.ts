import { Ctx, FieldResolver, ObjectType, Resolver, Root } from 'type-graphql';

import { ResolverContext } from '../../context';
import { AnswerBasic } from './AnswerBasic';
import { Question } from './Question';
import { Template } from './Template';

@ObjectType()
export class QuestionWithUsage extends Question {}

@Resolver(() => QuestionWithUsage)
export class QuestionWithAdminInfoResolver {
  @FieldResolver(() => [AnswerBasic])
  async answers(
    @Root() question: QuestionWithUsage,
    @Ctx() context: ResolverContext
  ): Promise<AnswerBasic[]> {
    return context.queries.questionary.dataSource.getAnswers(question.id);
  }

  @FieldResolver(() => [Template])
  async templates(
    @Root() question: QuestionWithUsage,
    @Ctx() context: ResolverContext
  ): Promise<Template[]> {
    return context.queries.questionary.dataSource.getTemplates(question.id);
  }
}
