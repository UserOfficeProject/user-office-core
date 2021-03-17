import {
  Ctx,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Template } from './Template';

@ObjectType()
export class ProposalTemplate extends Template {}

@Resolver((of) => ProposalTemplate)
export class TemplateResolver {
  @FieldResolver(() => Int)
  async callCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, { templateIds: [template.templateId] })
      .then((result) => result?.length || 0);
  }
}
