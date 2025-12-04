import { Query, Arg, Ctx, Resolver, Int, InputType, Field } from 'type-graphql';
import { ResolverContext } from '../../context';

@InputType()
export class AccessFilter {
  @Field(() => Int)
  public userId: number;

  @Field(() => String)
  public action: string;
}

@Resolver()
export class AccessQuery {
  @Query(() => Boolean)
  canAccess(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => AccessFilter) filter: AccessFilter
  ) {
    return context.queries.access.get(context.user, filter)
  }
}
