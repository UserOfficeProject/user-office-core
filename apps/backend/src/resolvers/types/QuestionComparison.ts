import { ObjectType, Field } from 'type-graphql';

import { Question } from './Question';
import {
  ConflictResolutionStrategy,
  QuestionComparison as QuestionComparisonOrigin,
  ComparisonStatus,
} from '../../models/Template';

@ObjectType()
export class QuestionComparison implements Partial<QuestionComparisonOrigin> {
  @Field(() => Question, { nullable: true })
  public existingQuestion: Question | null;

  @Field(() => Question)
  public newQuestion: Question;

  @Field(() => ComparisonStatus)
  public status: ComparisonStatus;

  @Field(() => ConflictResolutionStrategy)
  public conflictResolutionStrategy: ConflictResolutionStrategy;
}
