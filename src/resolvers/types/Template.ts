import {
  Field,
  ObjectType,
  Int,
  FieldResolver,
  Root,
  Ctx,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Template as TemplateOrigin } from '../../models/ProposalModel';
import { Question } from './Question';
import { TemplateStep } from './TemplateStep';

@ObjectType()
export class Template implements Partial<TemplateOrigin> {
  @Field(() => Int)
  public templateId: number;

  @Field()
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field()
  public isArchived: boolean;
}

@Resolver(of => Template)
export class TemplateResolver {
  @FieldResolver(() => Int)
  async proposalCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.proposal
      .getAll(context.user, { templateIds: [template.templateId] })
      .then(result => result?.totalCount || 0);
  }

  @FieldResolver(() => Int)
  async callCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, { templateIds: [template.templateId] })
      .then(result => result?.length || 0);
  }

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
}
