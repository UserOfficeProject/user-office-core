import { Args, ArgsType, Ctx, Field, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalView } from '../types/ProposalView';
import { ProposalsFilter } from './ProposalsQuery';

@ArgsType()
class ProposalsViewArgs {
  @Field(() => ProposalsFilter, { nullable: true })
  public filter?: ProposalsFilter;
}

@Resolver()
export class ProposalsViewQuery {
  @Query(() => [ProposalView], { nullable: true })
  async proposalsView(
    @Args() args: ProposalsViewArgs,
    @Ctx() context: ResolverContext
  ): Promise<ProposalView[] | null> {
    return context.queries.proposal.getAllView(context.user, args.filter);
  }
}
