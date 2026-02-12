import { Query, Arg, Ctx, Resolver, Int, InputType, Field } from 'type-graphql';
import { ResolverContext } from '../../context';
import { PermissionRule } from '../types/PermissionRule';

@InputType()
export class PermissionFilter {
  @Field(() => Int)
  public userId: number;

  @Field(() => String)
  public action: string;

  @Field(() => String)
  public subject: string
}

@Resolver()
export class PermissionQuery {
  @Query(() => PermissionRule)
  permissionRule(
    @Ctx() context: ResolverContext,
    @Arg('id', () => Int) id: number
  ) {
    return context.queries.permission.getPermissionRule(context.user, id)
  }
}
