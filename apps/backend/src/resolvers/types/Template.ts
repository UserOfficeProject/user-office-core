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

import { ExperimentSafetyPdfTemplate } from './ExperimentSafetyPdfTemplate';
import { ProposalPdfTemplate } from './ProposalPdfTemplate';
import { Question } from './Question';
import { TemplateGroup } from './TemplateGroup';
import { TemplateStep } from './TemplateStep';
import { ResolverContext } from '../../context';
import TemplateDataSource from '../../datasources/postgres/TemplateDataSource';
import {
  Template as TemplateOrigin,
  TemplateGroupId,
} from '../../models/Template';

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

  @FieldResolver(() => Int, { nullable: true })
  async proposalPdfCallCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, { proposalPdfTemplateIds: [template.templateId] })
      .then((result) => result?.length || 0);
  }

  @FieldResolver(() => Int, { nullable: true })
  async experimentSafetyPdfCallCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, {
        experimentSafetyPdfTemplateIds: [template.templateId],
      })
      .then((result) => result?.length || 0);
  }

  @FieldResolver(() => Int, { nullable: true })
  async proposalESICallCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, { esiTemplateIds: [template.templateId] })
      .then((result) => result?.length || 0);
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

  @FieldResolver(() => ProposalPdfTemplate, { nullable: true })
  async proposalPdfTemplate(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<ProposalPdfTemplate | null> {
    const templates =
      await context.queries.proposalPdfTemplate.getProposalPdfTemplates(
        context.user,
        {
          filter: { templateIds: [template.templateId] },
        }
      );

    return templates?.length ? templates[0] : null;
  }

  @FieldResolver(() => ExperimentSafetyPdfTemplate, { nullable: true })
  async experimentSafetyPdfTemplate(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<ExperimentSafetyPdfTemplate | null> {
    const templates =
      await context.queries.experimentSafetyPdfTemplate.getExperimentSafetyPdfTemplates(
        context.user,
        {
          filter: { templateIds: [template.templateId] },
        }
      );

    return templates?.length ? templates[0] : null;
  }
}
