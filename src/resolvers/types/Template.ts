import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import {
  Template as TemplateOrigin,
  TemplateCategoryId,
} from '../../models/Template';
import { Question } from './Question';
import { TemplateStep } from './TemplateStep';

@ObjectType()
export class Template implements Partial<TemplateOrigin> {
  @Field(() => Int)
  public templateId: number;

  @Field(() => TemplateCategoryId)
  public categoryId: TemplateCategoryId;

  @Field()
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field()
  public isArchived: boolean;
}

@Resolver(of => Template)
export class TemplateResolver {
  @FieldResolver(() => [TemplateStep])
  async steps(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<TemplateStep[] | null> {
    return context.queries.template.getTemplateSteps(
      context.user,
      template.templateId
    );
  }

  @FieldResolver(() => [Question])
  async complementaryQuestions(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<Question[] | null> {
    return context.queries.template.getComplementaryQuestions(
      context.user,
      template.templateId
    );
  }

  @FieldResolver(() => Int)
  async questionaryCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.questionary.getCount(
      context.user,
      template.templateId
    );
  }
}
