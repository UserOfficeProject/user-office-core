import { Ctx, Query, Resolver, Arg, ArgsType, Field, Args } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalTemplate } from '../types/ProposalTemplate';
import { ProposalsFilter } from './ProposalsQuery';

class ProposalTemplatesFilter {
  @Field()
  public isArchived?: boolean;
}

@ArgsType()
export class ProposalTemplatesArgs {
  @Field(() => ProposalsFilter, { nullable: true })
  public filter?: ProposalTemplatesFilter;
}
@Resolver()
export class ProposalTemplatesQuery {
  @Query(() => [ProposalTemplate])
  proposalTemplates(
    @Ctx() context: ResolverContext,
    @Args() args: ProposalTemplatesArgs
  ) {
    return context.queries.template.getProposalTemplates(context.user, args);
  }
}
