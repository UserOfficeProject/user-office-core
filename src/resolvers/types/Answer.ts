import { Field, ObjectType, Int } from 'type-graphql';

import { Answer as AnswerOrigin } from '../../models/Questionary';
import { IntStringDateBoolArray, AnswerType } from '../CustomScalars';
import { QuestionTemplateRelation } from './QuestionTemplateRelation';

@ObjectType()
export class Answer
  extends QuestionTemplateRelation
  implements Partial<AnswerOrigin>
{
  @Field(() => Int, { nullable: true })
  public answerId: number;

  @Field(() => IntStringDateBoolArray, { nullable: true })
  public value?: AnswerType;
}
