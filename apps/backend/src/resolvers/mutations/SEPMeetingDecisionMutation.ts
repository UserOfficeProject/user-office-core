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
import { SepMeetingDecision } from '../types/SepMeetingDecision';

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
  @Mutation(() => SepMeetingDecision)
  saveSepMeetingDecision(
    @Arg('saveSepMeetingDecisionInput')
    saveSepMeetingDecisionInput: SaveSEPMeetingDecisionInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.sep.saveSepMeetingDecision(
      context.user,
      saveSepMeetingDecisionInput
    );
  }
}
