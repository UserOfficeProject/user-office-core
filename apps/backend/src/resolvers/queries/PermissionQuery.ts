import { Query, Ctx, Resolver, Int, Field, ObjectType } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Permission } from '../types/Permission';

@ObjectType()
class PermissionQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Permission])
  public permissions: Permission[];
}

@Resolver()
export class PermissionQuery {
  @Query(() => PermissionQueryResult, { nullable: true })
  permissions(@Ctx() context: ResolverContext) {
    return context.queries.permission.getAll(context.user);
  }
}
