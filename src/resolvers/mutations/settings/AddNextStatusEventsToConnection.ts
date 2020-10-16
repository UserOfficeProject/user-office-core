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
import { SuccessResponseWrap } from '../../types/CommonWrappers';
import { wrapResponse } from '../../wrapResponse';

@InputType()
export class AddNextStatusEventsToConnectionInput {
  @Field(() => Int)
  public proposalWorkflowConnectionId: number;

  @Field(() => [String])
  public nextStatusEvents: string[];
}

@Resolver()
export class AddNextStatusEventsToConnectionMutation {
  @Mutation(() => SuccessResponseWrap)
  async addNextStatusEventsToConnection(
    @Ctx() context: ResolverContext,
    @Arg('addNextStatusEventsToConnectionInput')
    addNextStatusEventsToConnectionInput: AddNextStatusEventsToConnectionInput
  ) {
    return wrapResponse(
      context.mutations.proposalSettings.addNextStatusEventsToConnection(
        context.user,
        addNextStatusEventsToConnectionInput
      ),
      SuccessResponseWrap
    );
  }
}
