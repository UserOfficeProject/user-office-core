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
import { TechnicalReviewTemplate } from '../types/TechnicalReviewTemplate';
import { TemplateGroupId } from './../../models/Template';
@InputType()
class TechnicalReviewTemplatesFilter {
  @Field({ nullable: true })
  public isArchived?: boolean;

  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];
}

@ArgsType()
export class TechnicalReviewTemplatesArgs {
  @Field(() => TechnicalReviewTemplatesFilter, { nullable: true })
  public filter?: TechnicalReviewTemplatesFilter;
}

@Resolver()
export class TechnicalReviewTemplatesQuery {
  @Query(() => [TechnicalReviewTemplate], { nullable: true })
  technicalReviewTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: TechnicalReviewTemplatesArgs
  ) {
    return context.queries.template.getTemplates(context.user, {
      filter: {
        ...args.filter,
        group: TemplateGroupId.TECHNICAL_REVIEW,
      },
    });
  }
}
