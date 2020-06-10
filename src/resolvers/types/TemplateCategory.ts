import { Field, Int, ObjectType } from 'type-graphql';
import { TemplateCategory as TemplateCategoryOrigin } from '../../models/ProposalModel';

@ObjectType()
export class TemplateCategory implements Partial<TemplateCategoryOrigin> {
  @Field(() => Int)
  public categoryId: number;

  @Field()
  public name: string;
}
