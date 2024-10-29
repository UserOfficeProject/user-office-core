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
export class FapReviewTemplate extends Template {}

@Resolver((of) => FapReviewTemplate)
export class TemplateResolver {
  @FieldResolver(() => Int)
  async callCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, { fapReviewTemplateIds: [template.templateId] })
      .then((result) => result?.length || 0);
  }
}
