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
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public commentForUser?: string;

  @Field(() => String, { nullable: true })
  public commentForManagement?: string;

  @Field(() => ProposalEndStatus, { nullable: true })
  public recommendation?: ProposalEndStatus;

  @Field(() => Int, { nullable: true })
  public rankOrder?: number | null;

  @Field(() => Boolean, { nullable: true })
  public submitted?: boolean;
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
