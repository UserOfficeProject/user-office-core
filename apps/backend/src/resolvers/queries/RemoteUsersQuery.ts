import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { BasicUserDetails } from '../types/BasicUserDetails';

@Resolver()
export class RemoteUsersQuery {
  @Query(() => [BasicUserDetails])
  async remoteUsers(
    @Ctx() context: ResolverContext,
    @Arg('proposalPk', () => Int) proposalPk: number
  ): Promise<BasicUserDetails[]> {
    // TODO: This is a placeholder implementation. Replace with actual data fetching logic.
    return [];
  }
}
