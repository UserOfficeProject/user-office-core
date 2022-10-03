import { Arg, Ctx, Field, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ExperimentSafetyInput } from '../types/ExperimentSafetyInput';

@InputType()
export class GetProposalEsisFilter {
  @Field(() => Int, { nullable: true })
  scheduledEventId?: number;

  @Field(() => Int, { nullable: true })
  questionaryId?: number;

  @Field(() => Boolean, { nullable: true })
  isSubmitted?: boolean;

  @Field(() => Int, { nullable: true })
  callId?: number;

  @Field(() => Boolean, { nullable: true })
  hasEvaluation?: boolean;
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
