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
import { ProposalView } from '../types/ProposalView';
import { ProposalsFilter } from './ProposalsQuery';

@ArgsType()
class ProposalsViewArgs {
  @Field(() => ProposalsFilter, { nullable: true })
  public filter?: ProposalsFilter;

  @Field(() => Int, { nullable: true })
  public first?: number;

  @Field(() => Int, { nullable: true })
  public offset?: number;
}

@ObjectType()
class ProposalsViewResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [ProposalView])
  public proposals: ProposalView[];
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

  @Query(() => ProposalsViewResult, { nullable: true })
  async instrumentScientistProposals(
    @Args() args: ProposalsViewArgs,
    @Ctx() context: ResolverContext
  ): Promise<ProposalsViewResult | null> {
    return context.queries.proposal.getInstrumentScientistProposals(
      context.user,
      args.filter,
      args.first,
      args.offset
    );
  }
}
