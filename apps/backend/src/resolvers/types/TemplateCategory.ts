import { Field, ObjectType } from 'type-graphql';

import {
  TemplateCategory as TemplateCategoryOrigin,
  TemplateCategoryId,
} from '../../models/Template';

@ObjectType()
export class TemplateCategory implements Partial<TemplateCategoryOrigin> {
  @Field(() => TemplateCategoryId)
  public categoryId: TemplateCategoryId;

  @Field()
  public name: string;
}
