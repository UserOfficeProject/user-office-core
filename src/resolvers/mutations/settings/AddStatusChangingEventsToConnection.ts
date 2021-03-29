import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  InputType,
  Arg,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ProposalStatusChangingEventResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class AddStatusChangingEventsToConnectionInput {
  @Field(() => Int)
  public proposalWorkflowConnectionId: number;

  @Field(() => [String])
  public statusChangingEvents: string[];
}

@Resolver()
export class AddStatusChangingEventsToConnectionMutation {
  @Mutation(() => ProposalStatusChangingEventResponseWrap)
  async addStatusChangingEventsToConnection(
    @Ctx() context: ResolverContext,
    @Arg('addStatusChangingEventsToConnectionInput')
    addStatusChangingEventsToConnectionInput: AddStatusChangingEventsToConnectionInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.addStatusChangingEventsToConnection(
        context.user,
        addStatusChangingEventsToConnectionInput
      ),
      ProposalStatusChangingEventResponseWrap
    );
  }
}
