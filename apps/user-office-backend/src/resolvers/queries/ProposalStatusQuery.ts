import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalStatus } from '../types/ProposalStatus';

@Resolver()
export class ProposalStatusQuery {
  @Query(() => ProposalStatus, { nullable: true })
  proposalStatus(
    @Arg('id', () => Int) id: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.proposalSettings.getProposalStatus(context.user, id);
  }

  @Query(() => [ProposalStatus], { nullable: true })
  proposalStatuses(@Ctx() context: ResolverContext) {
    return context.queries.proposalSettings.getAllProposalStatuses(
      context.user
    );
  }
}
