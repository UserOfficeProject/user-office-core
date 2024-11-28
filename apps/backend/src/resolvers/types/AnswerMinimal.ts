import { Field, ObjectType } from 'type-graphql';

import { AnswerBasic as AnswerBasicOrig } from '../../models/Questionary';
import { IntStringDateBoolArray, AnswerType } from '../CustomScalars';

@ObjectType()
export class AnswerMinimal implements Partial<AnswerBasicOrig> {
  @Field(() => IntStringDateBoolArray)
  public answer: AnswerType;

  @Field(() => String)
  public questionId: string;
}
