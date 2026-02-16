import { Query, Ctx, Resolver, Int, Field, ObjectType, InputType, Args, ArgsType } from "type-graphql";
import { ResolverContext } from "../../context";
import { PermissionRule } from "../types/PermissionRule";

@InputType()
export class PermissionRulesFilter {
  @Field(() => String, { nullable: true })
  public role?: string;

  @Field(() => String, { nullable: true })
  public subject?: string;

  @Field(() => String, { nullable: true })
  public action?: string;
}

@ArgsType()
export class PermissionRulesArgs {
  @Field(() => PermissionRulesFilter, { nullable: true })
  public filter?: PermissionRulesFilter;
}

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
    @Args() filter: PermissionRulesArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.permission.getPermissionRules(context.user, filter)
  }
}
