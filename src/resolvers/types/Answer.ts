import { Field, ObjectType } from 'type-graphql';

import { Answer as AnswerOrigin } from '../../models/ProposalModel';
import { IntStringDateBool } from '../CustomScalars';
import { QuestionRel } from './TemplateQuestion';

@ObjectType()
export class Answer extends QuestionRel implements Partial<AnswerOrigin> {
  @Field(() => IntStringDateBool)
  public value: number | string | Date | boolean;
}
