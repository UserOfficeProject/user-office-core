import {
  Query,
  Ctx,
  Resolver,
  Args,
  ArgsType,
  Field,
  Int,
  ObjectType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SEP } from '../types/SEP';

@ArgsType()
export class SEPsArgs {
  @Field(() => Boolean, { nullable: true })
  active?: boolean;

  @Field(() => String, { nullable: true })
  filter?: string;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
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
    @Args() { active, filter, first, offset }: SEPsArgs,
    @Ctx() context: ResolverContext
  ): Promise<SEPsQueryResult | null> {
    return context.queries.sep.getAll(
      context.user,
      active,
      filter,
      first,
      offset
    );
  }
}
