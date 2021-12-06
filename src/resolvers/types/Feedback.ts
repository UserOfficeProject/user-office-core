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
import { Feedback as FeedbackOrigin } from '../../models/Feedback';
import { FeedbackStatus } from '../../models/Feedback';
import { Questionary } from './Questionary';

@ObjectType()
export class Feedback implements Partial<FeedbackOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public scheduledEventId: number;

  @Field(() => FeedbackStatus)
  public status: FeedbackStatus;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date, { nullable: true })
  public submittedAt: Date | null;
}

@Resolver(() => Feedback)
export class FeedbackResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() feedback: Feedback,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.feedback.getQuestionary(feedback.questionaryId);
  }
}
