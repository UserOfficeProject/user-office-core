import { Query, Ctx, Resolver, Int, Field, ObjectType } from "type-graphql";
import { ResolverContext } from "../../context";
import { PermissionRule } from "../types/PermissionRule";

@ObjectType()
class PermissionQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [PermissionRule])
  public permissionRule: PermissionRule[];
}

@Resolver()
export class AccessesQuery {
  @Query(() => PermissionQueryResult, { nullable: true })
  permissionRules(
    @Ctx() context: ResolverContext
  ) {
    return context.queries.permission.getPermissionRules(context.user)
  }
}
