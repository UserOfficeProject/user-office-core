import { Field, Int, ObjectType } from 'type-graphql';

import { DependenciesLogicOperator } from '../../models/ConditionEvaluator';
import { QuestionTemplateRelation as QuestionTemplateRelationOrigin } from '../../models/Template';
import { FieldConfigType } from './FieldConfig';
import { FieldDependency } from './FieldDependency';
import { Question } from './Question';

@ObjectType()
export class QuestionTemplateRelation
  implements Partial<QuestionTemplateRelationOrigin>
{
  @Field(() => Question)
  public question: Question;

  @Field(() => Int)
  public sortOrder: number;

  @Field(() => Int)
  public topicId: number;

  @Field(() => FieldConfigType)
  public config: typeof FieldConfigType;

  @Field(() => [FieldDependency])
  public dependencies: FieldDependency[];

  @Field(() => DependenciesLogicOperator, { nullable: true })
  public dependenciesOperator?: DependenciesLogicOperator;
}
