import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { PaginationSortDirection } from '../../utils/pagination';
import { Institution } from '../types/Institution';

@ArgsType()
export class InstitutionsPageArgs {
  @Field(() => Int, { defaultValue: 10 })
  public first = 10;

  @Field(() => Int, { defaultValue: 0 })
  public offset = 0;

  @Field({ nullable: true })
  public searchText?: string;

  @Field({ nullable: true })
  public sortField?: string;

  @Field(() => PaginationSortDirection, { nullable: true })
  public sortDirection?: PaginationSortDirection;
}

@ObjectType()
export class InstitutionsPage {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [Institution])
  public institutions: Institution[];
}

@Resolver()
export class InstitutionsPageQuery {
  @Query(() => InstitutionsPage, { nullable: true })
  institutionsPage(
    @Ctx() context: ResolverContext,
    @Args() args: InstitutionsPageArgs
  ) {
    return context.queries.admin.getInstitutionsPage(context.user, args);
  }
}
