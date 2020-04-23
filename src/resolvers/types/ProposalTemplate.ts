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
import { ProposalTemplate as ProposalTemplateOrigin } from '../../models/ProposalModel';
import { TemplateStep } from './TemplateStep';

@ObjectType()
export class ProposalTemplate implements Partial<ProposalTemplateOrigin> {
  @Field(() => Int)
  public templateId: number;

  @Field()
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field()
  public isArchived: boolean;
}

@Resolver(of => ProposalTemplate)
export class ProposalTemplateResolver {
  @FieldResolver(() => Int)
  async proposalCount(
    @Root() template: ProposalTemplate,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.proposal
      .getAll(context.user, { templateIds: [template.templateId] })
      .then(result => result?.totalCount || 0);
  }

  @FieldResolver(() => Int)
  async callCount(
    @Root() template: ProposalTemplate,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, { templateIds: [template.templateId] })
      .then(result => result?.length || 0);
  }

  @FieldResolver(() => [TemplateStep])
  async steps(
    @Root() template: ProposalTemplate,
    @Ctx() context: ResolverContext
  ): Promise<TemplateStep[] | null> {
    return context.queries.template.getProposalTemplateSteps(
      context.user,
      template.templateId
    );
  }
}
