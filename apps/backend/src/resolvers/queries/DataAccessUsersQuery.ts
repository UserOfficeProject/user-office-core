import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { BasicUserDetails } from '../types/BasicUserDetails';

@Resolver()
export class DataAccessUsersQuery {
  @Query(() => [BasicUserDetails])
  async dataAccessUsers(
    @Ctx() context: ResolverContext,
    @Arg('proposalPk', () => Int) proposalPk: number
  ): Promise<BasicUserDetails[]> {
    return context.queries.dataAccessUsers.findByProposalPk(
      context.user,
      proposalPk
    );
  }
}
