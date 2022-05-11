import 'reflect-metadata';
import {
  Resolver,
  Query,
  Args,
  Ctx,
  Int,
  Field,
  ObjectType,
  ArgsType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { UserRole } from '../../models/User';
import { BasicUserDetails } from '../types/BasicUserDetails';

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

  @Field(() => [Int], { nullable: 'itemsAndList' })
  subtractUsers?: [number];

  @Field(() => String, { nullable: true })
  orderBy?: string;

  @Field(() => String, { nullable: true })
  orderDirection?: string;
}

@ArgsType()
export class PreviousCollaboratorsArgs extends UsersArgs {
  @Field(() => Int, { nullable: false })
  userId: number;
}

@Resolver()
export class UsersQuery {
  @Query(() => UserQueryResult, { nullable: true })
  users(@Args() args: UsersArgs, @Ctx() context: ResolverContext) {
    return context.queries.user.getAll(context.user, args);
  }

  @Query(() => UserQueryResult, { nullable: true })
  previousCollaborators(
    @Args()
    {
      userId,
      filter,
      first,
      offset,
      userRole,
      subtractUsers,
    }: PreviousCollaboratorsArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.getPreviousCollaborators(
      context.user,
      userId,
      filter,
      first,
      offset,
      userRole,
      subtractUsers
    );
  }
}
