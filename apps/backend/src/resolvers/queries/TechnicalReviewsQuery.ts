import {
  Args,
  ArgsType,
  Ctx,
  Field,
  InputType,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewerFilter } from '../../models/Review';
import { TechnicalReview } from '../types/TechnicalReview';

@InputType()
export class TechnicalReviewsFilter {
  @Field(() => String, { nullable: true })
  public text?: string;

  @Field(() => [Int], { nullable: true })
  public questionaryIds?: number[];

  @Field(() => ReviewerFilter, { nullable: true })
  public reviewer?: ReviewerFilter;

  @Field(() => Int, { nullable: true })
  public callId?: number;

  @Field(() => [String], { nullable: true })
  public shortCodes?: string[];

  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];
}

@ArgsType()
class TechnicalReviewsArgs {
  @Field(() => TechnicalReviewsFilter, { nullable: true })
  public filter?: TechnicalReviewsFilter;

  @Field(() => Int, { nullable: true })
  public first?: number;

  @Field(() => Int, { nullable: true })
  public offset?: number;
}

@ObjectType()
class TechnicalReviewsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [TechnicalReview])
  public technicalReviews: TechnicalReview[];
}

@Resolver()
export class TechnicalReviewsQuery {
  @Query(() => TechnicalReviewsQueryResult, { nullable: true })
  async technicalReviews(
    @Args() args: TechnicalReviewsArgs,
    @Ctx() context: ResolverContext
  ): Promise<TechnicalReviewsQueryResult | null> {
    return context.queries.technicalReview.getAll(
      context.user,
      args.filter,
      args.first,
      args.offset
    );
  }
}
