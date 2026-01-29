import { Query, Ctx, Arg, Resolver, Int, Field, ObjectType } from "type-graphql";
import { ResolverContext } from "../../context";
import { AccessRule } from "../types/AccessRule";

@ObjectType()
class PermissionQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [AccessRule])
  public accessRule: AccessRule[];
}

@Resolver()
export class AccessesQuery {
  @Query(() => PermissionQueryResult, { nullable: true })
  accessRules(
    @Ctx() context: ResolverContext
  ) {
    return context.queries.access.getAccessRules(context.user)
  }
}
