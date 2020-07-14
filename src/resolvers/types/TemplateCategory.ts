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
  public categoryId: number;

  @Field()
  public name: string;
}

@Resolver(() => TemplateCategory)
export class TemplateCategoryResolver {
  @FieldResolver(() => Int)
  categoryIdAsInt(@Root() category: TemplateCategory) {
    return category.categoryId;
  }
}
