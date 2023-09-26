import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalStatus } from '../types/ProposalStatus';

@Resolver()
export class ProposalStatusQuery {
  @Query(() => ProposalStatus, { nullable: true })
  proposalStatus(
    @Arg('proposalStatusId', () => Int) proposalStatusId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.proposalSettings.getProposalStatus(
      context.user,
      proposalStatusId
    );
  }

  @Query(() => [ProposalStatus], { nullable: true })
  proposalStatuses(@Ctx() context: ResolverContext) {
    return context.queries.proposalSettings.getAllProposalStatuses(
      context.user
    );
  }
}
