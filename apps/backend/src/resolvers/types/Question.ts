import { Field, ObjectType } from 'type-graphql';

import { FieldConfigType } from './FieldConfig';
import {
  DataType,
  Question as QuestionOrigin,
  TemplateCategoryId,
} from '../../models/Template';

@ObjectType()
export class Question implements Partial<QuestionOrigin> {
  @Field()
  public id: string;

  @Field(() => TemplateCategoryId)
  public categoryId: TemplateCategoryId;

  @Field()
  public naturalKey: string;

  @Field(() => DataType)
  public dataType: DataType;

  @Field()
  public question: string;

  @Field(() => FieldConfigType)
  public config: typeof FieldConfigType;
}
