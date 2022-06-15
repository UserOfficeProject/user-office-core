import { Field, ObjectType } from 'type-graphql';

import {
  TemplateCategoryId,
  TemplateGroup as TemplateGroupOrigin,
  TemplateGroupId,
} from '../../models/Template';

@ObjectType()
export class TemplateGroup implements Partial<TemplateGroupOrigin> {
  @Field(() => TemplateGroupId)
  public groupId: TemplateGroupId;

  @Field(() => TemplateCategoryId)
  public categoryId: TemplateCategoryId;
}
