import { Field, ObjectType } from 'type-graphql';

import { Question as QuestionOrigin } from '../../models/ProposalModel';
import { DataType } from './../../models/ProposalModel';
import { FieldConfigType } from './FieldConfig';

@ObjectType()
export class Question implements Partial<QuestionOrigin> {
  @Field()
  public proposal_question_id: string;

  @Field()
  public natural_key: string;

  @Field(() => DataType)
  public data_type: DataType;

  @Field()
  public question: string;

  @Field(() => FieldConfigType)
  public config: typeof FieldConfigType;
}
