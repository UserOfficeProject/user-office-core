import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PermissionsWithAccessToken } from '../types/PermissionsWithAccessToken';

@Resolver()
export class GetAllQueryAndMutationMethodsQuery {
  @Query(() => [PermissionsWithAccessToken], { nullable: true })
  allAccessTokensAndPermissions(@Ctx() context: ResolverContext) {
    return context.queries.admin.getAllTokensAndPermissions(context.user);
  }
}
