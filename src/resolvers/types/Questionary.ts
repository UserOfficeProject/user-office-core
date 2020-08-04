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
  @Field(() => Int, { nullable: true }) // null if questionary is blank
  public questionaryId?: number;

  @Field(() => Int)
  public templateId: number;

  @Field(() => Date)
  public created: Date;
}

@Resolver(of => Questionary)
export class QuestionaryResolver {
  @FieldResolver(() => [QuestionaryStep])
  async steps(
    @Root() questionary: Questionary,
    @Ctx() context: ResolverContext
  ): Promise<QuestionaryStep[] | null> {
    if (!questionary.questionaryId) {
      // if questionary is blank
      return context.queries.questionary.getBlankQuestionarySteps(
        context.user,
        questionary.templateId
      );
    } else {
      return context.queries.questionary.getQuestionarySteps(
        context.user,
        questionary.questionaryId
      );
    }
  }
}
