import {
  Arg,
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

  @Field({ nullable: true })
  public sortField?: string;

  @Field({ nullable: true })
  public sortDirection?: string;

  @Field({ nullable: true })
  public searchText?: string;
}

@ObjectType()
class ProposalsViewResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [ProposalView])
  public proposals: ProposalView[];
}

@ObjectType()
class ProposalsViewQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [ProposalView])
  public proposalViews: ProposalView[];
}
@Resolver()
export class ProposalsViewQuery {
  @Query(() => ProposalsViewQueryResult, { nullable: true })
  async proposalsView(
    @Args() args: ProposalsViewArgs,
    @Ctx() context: ResolverContext
  ): Promise<ProposalsViewQueryResult> {
    return context.queries.proposal.getAllView(
      context.user,
      args.filter,
      args.first,
      args.offset,
      args.sortField,
      args.sortDirection,
      args.searchText
    );
  }

  @Query(() => ProposalsViewResult, { nullable: true })
  async instrumentScientistProposals(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => ProposalsFilter, { nullable: true })
    filter?: ProposalsFilter,
    @Arg('first', () => Int, { nullable: true }) first?: number,
    @Arg('offset', () => Int, { nullable: true }) offset?: number
  ): Promise<ProposalsViewResult | null> {
    return context.queries.proposal.getInstrumentScientistProposals(
      context.user,
      filter,
      first,
      offset
    );
  }
}
