import {
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
  InputType,
  Arg,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { CallResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class UpdateCallInput {
  @Field(() => Int)
  public id: number;

  @Field()
  public shortCode: string;

  @Field()
  public startCall: Date;

  @Field()
  public endCall: Date;

  @Field()
  public startReview: Date;

  @Field()
  public endReview: Date;

  @Field()
  public startNotify: Date;

  @Field()
  public endNotify: Date;

  @Field()
  public startCycle: Date;

  @Field()
  public endCycle: Date;

  @Field()
  public cycleComment: string;

  @Field()
  public surveyComment: string;

  @Field(() => Int, { nullable: true })
  public proposalWorkflowId: number;

  @Field(() => Int, { nullable: true })
  public templateId?: number;
}

@InputType()
export class AssignInstrumentsToCallInput {
  @Field(() => [Int])
  instrumentIds: number[];

  @Field(() => Int)
  callId: number;
}

@InputType()
export class RemoveAssignedInstrumentFromCallInput {
  @Field(() => Int)
  instrumentId: number;

  @Field(() => Int)
  callId: number;
}

@Resolver()
export class UpdateCallMutation {
  @Mutation(() => CallResponseWrap)
  updateCall(
    @Arg('updateCallInput')
    updateCallInput: UpdateCallInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.call.update(context.user, updateCallInput),
      CallResponseWrap
    );
  }

  @Mutation(() => CallResponseWrap)
  assignInstrumentsToCall(
    @Arg('assignInstrumentsToCallInput')
    assignInstrumentsToCallInput: AssignInstrumentsToCallInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.call.assignInstrumentsToCall(
        context.user,
        assignInstrumentsToCallInput
      ),
      CallResponseWrap
    );
  }

  @Mutation(() => CallResponseWrap)
  removeAssignedInstrumentFromCall(
    @Arg('removeAssignedInstrumentFromCallInput')
    removeAssignedInstrumentFromCallInput: RemoveAssignedInstrumentFromCallInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.call.removeAssignedInstrumentFromCall(
        context.user,
        removeAssignedInstrumentFromCallInput
      ),
      CallResponseWrap
    );
  }
}
