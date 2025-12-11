import { Query, Arg, Ctx, Resolver, Int, InputType, Field } from 'type-graphql';
import { ResolverContext } from '../../context';

@InputType()
export class FapAccessFilter {
  @Field(() => Int)
  public userId: number;

  @Field(() => String)
  public role: string;

  @Field(() => String)
  public action: string;

  @Field(() => String)
  public subject: string;

  @Field(() => Int)
  public fapId: number;
}

@Resolver()
export class FapAccessQuery {
  @Query(() => Boolean)
  canAccessFap(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => FapAccessFilter) filter: FapAccessFilter
  ) {
    return context.queries.fap.getAccess(context.user, filter);
  }
}
