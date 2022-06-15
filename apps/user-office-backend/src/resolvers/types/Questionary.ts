import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Questionary as QuestionaryOrigin } from '../../models/Questionary';
import { QuestionaryStep } from './QuestionaryStep';

@ObjectType()
export class Questionary implements Partial<QuestionaryOrigin> {
  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Int)
  public templateId: number;

  @Field(() => Date)
  public created: Date;
}

@Resolver((of) => Questionary)
export class QuestionaryResolver {
  @FieldResolver(() => [QuestionaryStep])
  async steps(
    @Root() questionary: Questionary,
    @Ctx() context: ResolverContext
  ): Promise<QuestionaryStep[] | null> {
    return context.queries.questionary.getQuestionaryStepsOrDefault(
      context.user,
      questionary.questionaryId,
      questionary.templateId
    );
  }

  @FieldResolver(() => Boolean)
  async isCompleted(
    @Root() questionary: Questionary,
    @Ctx() context: ResolverContext
  ): Promise<boolean> {
    return context.queries.questionary.isCompleted(
      context.user,
      questionary.questionaryId
    );
  }
}
