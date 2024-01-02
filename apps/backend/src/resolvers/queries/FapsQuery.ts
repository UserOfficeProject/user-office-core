import {
  Query,
  Ctx,
  Resolver,
  InputType,
  Field,
  Int,
  ObjectType,
  Arg,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Fap } from '../types/Fap';

@InputType()
export class FapsFilter {
  @Field(() => Boolean, { nullable: true })
  active?: boolean;

  @Field(() => String, { nullable: true })
  filter?: string;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => [Int], { nullable: true })
  public callIds?: number[];
}

@ObjectType()
class FapsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Fap])
  public faps: Fap[];
}

@Resolver()
export class FapsQuery {
  @Query(() => FapsQueryResult, { nullable: true })
  async faps(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => FapsFilter, { nullable: true }) filter: FapsFilter
  ): Promise<FapsQueryResult | null> {
    return context.queries.fap.getAll(context.user, filter);
  }
}
