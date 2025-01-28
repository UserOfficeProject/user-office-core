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
export class TechnicalReviewTemplate extends Template {}

@Resolver((of) => TechnicalReviewTemplate)
export class TemplateResolver {
  @FieldResolver(() => Int)
  async callCount(
    @Root() template: Template,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.call
      .getAll(context.user, {
        technicalReviewTemplateIds: [template.templateId],
      })
      .then((result) => result?.length || 0);
  }
}
