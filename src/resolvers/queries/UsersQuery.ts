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
import { BasicUserDetails } from "../../models/User";
import { ResolverContext } from "../../context";

@ObjectType()
class UserQueryResult {
  @Field(() => [BasicUserDetails])
  public users: BasicUserDetails[];

  @Field(() => Int)
  public totalCount: number;
}

@ArgsType()
class UsersArgs {
  @Field(() => String, { nullable: true })
  filter?: string;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => Boolean, { nullable: true })
  usersOnly?: boolean;

  @Field(() => [Int], { nullable: "itemsAndList" })
  subtractUsers?: [number];
}

@Resolver()
export class UsersQuery {
  @Query(() => UserQueryResult, { nullable: true })
  users(
    @Args() { filter, first, offset, usersOnly, subtractUsers }: UsersArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.getAll(
      context.user,
      filter,
      first,
      offset,
      usersOnly,
      subtractUsers
    );
  }
}
