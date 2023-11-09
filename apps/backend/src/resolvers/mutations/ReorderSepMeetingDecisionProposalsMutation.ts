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
import { SepMeetingDecision } from '../types/SepMeetingDecision';

@InputType()
export class ProposalPkWithRankOrder {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => Int)
  public rankOrder: number;
}

@InputType()
export class ReorderSepMeetingDecisionProposalsInput {
  @Field(() => [ProposalPkWithRankOrder])
  public proposals: ProposalPkWithRankOrder[];
}

@Resolver()
export class ReorderSepMeetingDecisionProposalsMutation {
  @Mutation(() => SepMeetingDecision)
  reorderSepMeetingDecisionProposals(
    @Arg('reorderSepMeetingDecisionProposalsInput')
    reorderSepMeetingDecisionProposalsInput: ReorderSepMeetingDecisionProposalsInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.reorderSepMeetingDecisionProposals(
      context.user,
      reorderSepMeetingDecisionProposalsInput
    );
  }
}
