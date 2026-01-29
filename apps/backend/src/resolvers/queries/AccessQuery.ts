import { Query, Arg, Ctx, Resolver, Int, InputType, Field } from 'type-graphql';
import { ResolverContext } from '../../context';
import { AccessRule } from '../types/AccessRule';

@InputType()
export class AccessFilter {
  @Field(() => Int)
  public userId: number;

  @Field(() => String)
  public action: string;

  @Field(() => String)
  public subject: string
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

  @Query(() => AccessRule)
  accessRule(
    @Ctx() context: ResolverContext,
    @Arg('id', () => Int) id: number
  ) {
    return context.queries.access.getAccessRule(context.user, id)
  }
}
