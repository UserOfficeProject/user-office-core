import { Field, Float, Int, ObjectType } from 'type-graphql';

import { QuestionTemplateRelation as QuestionTemplateRelationOrign } from '../../models/Template';
import { FieldConfigType } from './FieldConfig';
import { FieldDependency } from './FieldDependency';
import { Question } from './Question';

@ObjectType()
export class QuestionTemplateRelation
  implements Partial<QuestionTemplateRelationOrign> {
  @Field(() => Question)
  public question: Question;

  @Field(() => Float)
  public sortOrder: number;

  @Field(() => Int)
  public topicId: number;

  @Field(() => FieldConfigType)
  public config: typeof FieldConfigType;

  @Field(() => FieldDependency, { nullable: true })
  public dependency?: FieldDependency;
}
