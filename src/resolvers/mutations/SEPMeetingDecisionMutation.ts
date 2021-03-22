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
import { SepMeetingDecisionResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class SaveSEPMeetingDecisionInput {
  @Field(() => Int)
  public proposalId: number;

  @Field(() => String)
  public commentForUser: string;

  @Field(() => String)
  public commentForManagement: string;

  @Field(() => ProposalEndStatus)
  public recommendation: ProposalEndStatus;

  @Field(() => Int)
  public rankOrder: number;

  @Field(() => Boolean)
  public submitted: boolean;
}

@Resolver()
export class SEPMeetingDecisionMutation {
  @Mutation(() => SepMeetingDecisionResponseWrap)
  saveSepMeetingDecision(
    @Arg('saveSepMeetingDecisionInput')
    saveSepMeetingDecisionInput: SaveSEPMeetingDecisionInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.saveSepMeetingDecision(
        context.user,
        saveSepMeetingDecisionInput
      ),
      SepMeetingDecisionResponseWrap
    );
  }
}
