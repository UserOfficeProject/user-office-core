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
export class OverwriteSepMeetingDecisionRankingInput {
  @Field(() => Int)
  public proposalId: number;

  @Field(() => Int)
  public rankOrder: number;
}

@Resolver()
export class OverwriteSepMeetingDecisionRankingMutation {
  @Mutation(() => SepMeetingDecisionResponseWrap)
  overwriteSepMeetingDecisionRanking(
    @Arg('overwriteSepMeetingDecisionRankingInput')
    overwriteSepMeetingDecisionRankingInput: OverwriteSepMeetingDecisionRankingInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.overwriteSepMeetingDecisionRanking(
        context.user,
        overwriteSepMeetingDecisionRankingInput
      ),
      SepMeetingDecisionResponseWrap
    );
  }
}
