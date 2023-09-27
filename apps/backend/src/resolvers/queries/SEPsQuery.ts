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
import { SEP } from '../types/SEP';

@InputType()
export class SEPsFilter {
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
class SEPsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [SEP])
  public seps: SEP[];
}

@Resolver()
export class SEPsQuery {
  @Query(() => SEPsQueryResult, { nullable: true })
  async seps(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => SEPsFilter, { nullable: true }) filter: SEPsFilter
  ): Promise<SEPsQueryResult | null> {
    return context.queries.sep.getAll(context.user, filter);
  }
}
