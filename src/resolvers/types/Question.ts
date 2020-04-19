import { Field, ObjectType } from 'type-graphql';

import { Question as QuestionOrigin } from '../../models/ProposalModel';
import { DataType } from './../../models/ProposalModel';
import { FieldConfigType } from './FieldConfig';

@ObjectType()
export class Question implements Partial<QuestionOrigin> {
  @Field()
  public proposalQuestionId: string;

  @Field()
  public naturalKey: string;

  @Field(() => DataType)
  public dataType: DataType;

  @Field()
  public question: string;

  @Field(() => FieldConfigType)
  public config: typeof FieldConfigType;
}
