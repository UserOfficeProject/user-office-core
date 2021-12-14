import { ObjectType, Field } from 'type-graphql';

import {
  ConflictResolutionStrategy,
  QuestionComparison as QuestionComparisonOrigin,
  QuestionComparisonStatus,
} from '../../models/Template';
import { Question } from './Question';

@ObjectType()
export class QuestionComparison implements Partial<QuestionComparisonOrigin> {
  @Field(() => Question, { nullable: true })
  public existingQuestion: Question | null;

  @Field(() => Question)
  public newQuestion: Question;

  @Field(() => QuestionComparisonStatus)
  public status: QuestionComparisonStatus;

  @Field(() => ConflictResolutionStrategy)
  public conflictResolutionStrategy: ConflictResolutionStrategy;
}
