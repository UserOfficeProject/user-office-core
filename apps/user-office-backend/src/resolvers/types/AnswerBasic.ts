import { Field, Int, ObjectType } from 'type-graphql';

import { AnswerBasic as AnswerBasicOrig } from '../../models/Questionary';
import { IntStringDateBoolArray, AnswerType } from '../CustomScalars';

@ObjectType()
export class AnswerBasic implements Partial<AnswerBasicOrig> {
  @Field(() => Int, { nullable: true })
  public answerId: number;

  @Field(() => IntStringDateBoolArray)
  public answer: AnswerType;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => String)
  public questionId: string;

  @Field(() => Date)
  public createdAt: Date;
}
