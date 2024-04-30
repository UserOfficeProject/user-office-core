import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { FapMeetingDecision } from '../types/FapMeetingDecision';

@InputType()
export class ProposalPkWithRankOrder {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public rankOrder: number;
}

@InputType()
export class ReorderFapMeetingDecisionProposalsInput {
  @Field(() => [ProposalPkWithRankOrder])
  public proposals: ProposalPkWithRankOrder[];
}

@Resolver()
export class ReorderFapMeetingDecisionProposalsMutation {
  @Mutation(() => FapMeetingDecision)
  reorderFapMeetingDecisionProposals(
    @Arg('reorderFapMeetingDecisionProposalsInput')
    reorderFapMeetingDecisionProposalsInput: ReorderFapMeetingDecisionProposalsInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.fap.reorderFapMeetingDecisionProposals(
      context.user,
      reorderFapMeetingDecisionProposalsInput
    );
  }
}
