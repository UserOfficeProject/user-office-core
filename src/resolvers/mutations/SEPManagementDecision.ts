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
import { ProposalEndStatus } from '../../models/Proposal';
import { ProposalResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class SEPMeetingDecisionInput {
  @Field(() => Int)
  public proposalId: number;

  @Field(() => String, { nullable: true })
  public commentForUser: string;

  @Field(() => String, { nullable: true })
  public commentForManagement: string;

  @Field(() => ProposalEndStatus, { nullable: true })
  public recommendation: ProposalEndStatus;

  @Field(() => Int, { nullable: true })
  public rankOrder: number;

  @Field(() => Boolean, { nullable: true })
  public submitted: boolean;
}

@Resolver()
export class SEPMeetingDecisionMutation {
  @Mutation(() => ProposalResponseWrap)
  sepMeetingDecision(
    @Arg('sepMeetingDecisionInput')
    sepMeetingDecisionInput: SEPMeetingDecisionInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.sepMeetingDecision(
        context.user,
        sepMeetingDecisionInput
      ),
      ProposalResponseWrap
    );
  }
}
