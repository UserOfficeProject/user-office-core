import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SafetyNotificationResponse } from '../../models/SafetyNotificationResponse';
import { Proposal } from '../types/Proposal';

@ArgsType()
export class NotifySafetyArgs {
  @Field(() => Int)
  public proposalPk: number;
  @Field(() => [String])
  public safetyManagerEmails: string[];
  @Field(() => String)
  public templateId: string;
}

@Resolver()
export class NotifyProposalMutation {
  @Mutation(() => Proposal)
  async notifySafety(
    @Args()
    args: NotifySafetyArgs,
    @Ctx() context: ResolverContext
  ) {
    const { proposalPk, safetyManagerEmails, templateId } = args;
    const result = await context.mutations.proposal.notifySafety(context.user, {
      proposalPk,
      safetyManagerEmails,
      templateId,
    });

    if (result instanceof SafetyNotificationResponse) {
      return result.proposal;
    }

    return result;
  }
}
