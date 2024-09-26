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
import { Review } from '../types/Review';

@InputType()
export class ReviewsFilter {
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
class ReviewsArgs {
  @Field(() => ReviewsFilter, { nullable: true })
  public filter?: ReviewsFilter;

  @Field(() => Int, { nullable: true })
  public first?: number;

  @Field(() => Int, { nullable: true })
  public offset?: number;
}

@ObjectType()
class ReviewsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Review])
  public reviews: Review[];
}

@Resolver()
export class ReviewsQuery {
  @Query(() => ReviewsQueryResult, { nullable: true })
  async reviews(
    @Args() args: ReviewsArgs,
    @Ctx() context: ResolverContext
  ): Promise<ReviewsQueryResult | null> {
    return context.queries.review.getAll(
      context.user,
      args.filter,
      args.first,
      args.offset
    );
  }
}
