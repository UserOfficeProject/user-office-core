import "reflect-metadata";
import {
  Resolver,
  Query,
  Args,
  Ctx,
  Int,
  Field,
  ObjectType,
  ArgsType
} from "type-graphql";
import { ResolverContext } from "../../context";
import { BasicUserDetails } from "../types/BasicUserDetails";
import { UserRole } from "../../models/User";

@ObjectType()
class UserQueryResult {
  @Field(() => [BasicUserDetails])
  public users: BasicUserDetails[];

  @Field(() => Int)
  public totalCount: number;
}

@ArgsType()
export class UsersArgs {
  @Field(() => String, { nullable: true })
  filter?: string;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => UserRole, { nullable: true })
  userRole?: UserRole;

  @Field(() => [Int], { nullable: "itemsAndList" })
  subtractUsers?: [number];
}

@Resolver()
export class UsersQuery {
  @Query(() => UserQueryResult, { nullable: true })
  users(
    @Args() { filter, first, offset, userRole, subtractUsers }: UsersArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.getAll(
      context.user,
      filter,
      first,
      offset,
      userRole,
      subtractUsers
    );
  }
}
