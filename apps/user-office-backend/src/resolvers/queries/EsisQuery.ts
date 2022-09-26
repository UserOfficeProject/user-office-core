import { Arg, Ctx, Field, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafetyInput } from '../types/ExperimentSafetyInput';

@InputType()
export class GetProposalEsisFilter {
  @Field(() => Int)
  scheduledEventId?: number;

  @Field(() => Int)
  questionaryId?: number;
}

@Resolver()
export class EsisQuery {
  @Query(() => [ExperimentSafetyInput], { nullable: true })
  esis(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => GetProposalEsisFilter, { nullable: true })
    filter?: GetProposalEsisFilter
  ) {
    return context.queries.proposalEsi.getEsis(context.user, filter);
  }
}
