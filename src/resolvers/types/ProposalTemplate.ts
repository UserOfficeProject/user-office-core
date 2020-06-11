import {
  ObjectType,
  Resolver,
  FieldResolver,
  Int,
  Root,
  Ctx,
} from 'type-graphql';
import { Template } from './Template';
import { ResolverContext } from '../../context';

@ObjectType()
export class ProposalTemplate extends Template {}

@Resolver(of => ProposalTemplate)
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
}
