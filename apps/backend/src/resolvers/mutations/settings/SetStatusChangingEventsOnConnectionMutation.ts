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
export class SetStatusChangingEventsOnConnectionInput {
  @Field(() => Int)
  public workflowConnectionId: number;

  @Field(() => [String])
  public statusChangingEvents: string[];
}

@Resolver()
export class SetStatusChangingEventsOnConnectionMutation {
  @Mutation(() => [StatusChangingEvent])
  async setStatusChangingEventsOnConnection(
    @Ctx() context: ResolverContext,
    @Arg('setStatusChangingEventsOnConnectionInput')
    setStatusChangingEventsOnConnectionInput: SetStatusChangingEventsOnConnectionInput
  ) {
    return context.mutations.workflow.setStatusChangingEventsOnConnection(
      context.user,
      setStatusChangingEventsOnConnectionInput
    );
  }
}
