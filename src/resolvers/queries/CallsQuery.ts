import { Ctx, Field, InputType, Int, Query, Resolver, Arg } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Call } from '../types/Call';

@InputType()
export class CallsFilter {
  @Field(() => [Int], { nullable: true })
  public templateIds?: number[];

  @Field(() => Boolean, { nullable: true })
  public isActive?: boolean;

  @Field(() => Boolean, { nullable: true })
  public isEnded?: boolean;
}

@Resolver()
export class CallsQuery {
  @Query(() => [Call], { nullable: true })
  calls(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => CallsFilter, { nullable: true }) filter: CallsFilter
  ) {
    return context.queries.call.getAll(context.user, filter);
  }
}
