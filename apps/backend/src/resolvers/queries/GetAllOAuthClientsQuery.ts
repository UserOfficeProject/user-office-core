import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { OAuthClient } from '../types/OAuthClient';

@Resolver()
export class GetAllOAuthClientsQuery {
  @Query(() => [OAuthClient], { nullable: true })
  allOAuthClients(@Ctx() context: ResolverContext) {
    return context.queries.admin.getAllOAuthClients(context.user);
  }
}
