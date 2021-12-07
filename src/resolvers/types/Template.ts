import { container } from 'tsyringe';
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
import TemplateDataSource from '../../datasources/postgres/TemplateDataSource';
import {
  Template as TemplateOrigin,
  TemplateGroupId,
} from '../../models/Template';
import { Question } from './Question';
import { TemplateGroup } from './TemplateGroup';
import { TemplateStep } from './TemplateStep';

@ObjectType()
export class Template implements Partial<TemplateOrigin> {
  @Field(() => Int)
  public templateId: number;

  @Field(() => TemplateGroupId)
  public groupId: TemplateGroupId;

  @Field()
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field()
  public isArchived: boolean;
}

@Resolver((of) => Template)
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

  @FieldResolver(() => TemplateGroup)
  async group(@Root() template: Template): Promise<TemplateGroup> {
    const templateDataSource = container.resolve(TemplateDataSource);

    return templateDataSource.getGroup(template.groupId);
  }

  @FieldResolver(() => String)
  async json(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<string> {
    return context.queries.template.getTemplateAsJson(
      context.user,
      template.templateId
    );
  }
}
