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
import { StatusChangingEvent } from '../../types/StatusChangingEvent';

@InputType()
export class AddStatusChangingEventsToConnectionInput {
  @Field(() => Int)
  public proposalWorkflowConnectionId: number;

  @Field(() => [String])
  public statusChangingEvents: string[];
}

@Resolver()
export class AddStatusChangingEventsToConnectionMutation {
  @Mutation(() => [StatusChangingEvent])
  async addStatusChangingEventsToConnection(
    @Ctx() context: ResolverContext,
    @Arg('addStatusChangingEventsToConnectionInput')
    addStatusChangingEventsToConnectionInput: AddStatusChangingEventsToConnectionInput
  ) {
    return context.mutations.proposalSettings.addStatusChangingEventsToConnection(
      context.user,
      addStatusChangingEventsToConnectionInput
    );
  }
}
