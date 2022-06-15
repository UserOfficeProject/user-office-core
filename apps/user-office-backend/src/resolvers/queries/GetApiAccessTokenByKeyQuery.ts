import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PermissionsWithAccessToken } from '../types/PermissionsWithAccessToken';

@Resolver()
export class GetAllQueryAndMutationMethodsQuery {
  @Query(() => PermissionsWithAccessToken, { nullable: true })
  accessTokenAndPermissions(
    @Arg('accessTokenId', () => String) accessTokenId: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.admin.getTokenAndPermissionsById(
      context.user,
      accessTokenId
    );
  }
}
