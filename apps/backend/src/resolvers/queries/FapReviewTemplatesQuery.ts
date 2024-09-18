import {
  Args,
  Ctx,
  Query,
  Resolver,
  InputType,
  Field,
  ArgsType,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { FapReviewTemplate } from '../types/FapReviewTemplate';
import { TemplateGroupId } from './../../models/Template';
@InputType()
class FapReviewTemplatesFilter {
  @Field({ nullable: true })
  public isArchived?: boolean;

  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];
}

@ArgsType()
export class FapReviewTemplatesArgs {
  @Field(() => FapReviewTemplatesFilter, { nullable: true })
  public filter?: FapReviewTemplatesFilter;
}

@Resolver()
export class FapReviewTemplatesQuery {
  @Query(() => [FapReviewTemplate], { nullable: true })
  fapReviewTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: FapReviewTemplatesArgs
  ) {
    return context.queries.template.getTemplates(context.user, {
      filter: {
        ...args.filter,
        group: TemplateGroupId.FAP_REVIEW,
      },
    });
  }
}
