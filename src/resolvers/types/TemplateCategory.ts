import {
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import {
  TemplateCategory as TemplateCategoryOrigin,
  TemplateCategoryId,
} from '../../models/ProposalModel';

@ObjectType()
export class TemplateCategory implements Partial<TemplateCategoryOrigin> {
  @Field(() => TemplateCategoryId)
  public categoryId: TemplateCategoryId;

  @Field()
  public name: string;
}
