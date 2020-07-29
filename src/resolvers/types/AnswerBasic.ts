import { Field, Int, ObjectType } from 'type-graphql';
import { AnswerBasic as AnswerBasicOrig } from '../../models/ProposalModel';
import { IntStringDateBool } from '../CustomScalars';

@ObjectType()
export class AnswerBasic implements Partial<AnswerBasicOrig> {
  @Field(() => Int, { nullable: true })
  public answerId: number;

  @Field(() => IntStringDateBool)
  public answer: number | string | Date | boolean;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => String)
  public questionId: string;

  @Field(() => Date)
  public createdAt: Date;
}
