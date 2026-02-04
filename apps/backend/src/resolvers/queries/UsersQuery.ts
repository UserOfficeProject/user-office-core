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
import { PaginationSortDirection } from '../../utils/pagination';
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
  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => UserRole, { nullable: true })
  userRole?: UserRole;

  @Field(() => [Int], { nullable: 'itemsAndList' })
  subtractUsers?: [number];

  @Field({ nullable: true })
  public sortField?: string;

  @Field(() => PaginationSortDirection, { nullable: true })
  public sortDirection?: PaginationSortDirection;

  @Field({ nullable: true })
  public searchText?: string;
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
      first,
      offset,
      userRole,
      subtractUsers,
      sortField,
      sortDirection,
      searchText,
    }: PreviousCollaboratorsArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.getPreviousCollaborators(
      context.user,
      userId,
      first,
      offset,
      sortField,
      sortDirection,
      searchText,
      userRole,
      subtractUsers
    );
  }
}
