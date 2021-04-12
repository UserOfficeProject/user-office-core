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
import { SepMeetingDecisionResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class ProposalIdWithRankOrder {
  @Field(() => Int)
  public proposalId: number;

  @Field(() => Int)
  public rankOrder: number;
}

@InputType()
export class ReorderSepMeetingDecisionProposalsInput {
  @Field(() => [ProposalIdWithRankOrder])
  public proposals: ProposalIdWithRankOrder[];
}

@Resolver()
export class ReorderSepMeetingDecisionProposalsMutation {
  @Mutation(() => SepMeetingDecisionResponseWrap)
  reorderSepMeetingDecisionProposals(
    @Arg('reorderSepMeetingDecisionProposalsInput')
    reorderSepMeetingDecisionProposalsInput: ReorderSepMeetingDecisionProposalsInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.reorderSepMeetingDecisionProposals(
        context.user,
        reorderSepMeetingDecisionProposalsInput
      ),
      SepMeetingDecisionResponseWrap
    );
  }
}
