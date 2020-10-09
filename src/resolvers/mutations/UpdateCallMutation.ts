import {
  Args,
  ArgsType,
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

@ArgsType()
export class UpdateCallArgs {
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
  public templateId?: number;
}

@ArgsType()
export class AssignInstrumentToCallArgs {
  @Field(() => [Int])
  instrumentIds: number[];

  @Field(() => Int)
  callId: number;
}

@InputType()
export class AssignOrRemoveProposalWorkflowToCallInput {
  @Field(() => Int)
  proposalWorkflowId: number;

  @Field(() => Int)
  callId: number;
}

@ArgsType()
export class RemoveAssignedInstrumentFromCallArgs {
  @Field(() => Int)
  instrumentId: number;

  @Field(() => Int)
  callId: number;
}

@Resolver()
export class UpdateCallMutation {
  @Mutation(() => CallResponseWrap)
  updateCall(@Args() args: UpdateCallArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.call.update(context.user, args),
      CallResponseWrap
    );
  }

  @Mutation(() => CallResponseWrap)
  assignInstrumentToCall(
    @Args() args: AssignInstrumentToCallArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.call.assignInstrumentToCall(context.user, args),
      CallResponseWrap
    );
  }

  @Mutation(() => CallResponseWrap)
  removeAssignedInstrumentFromCall(
    @Args() args: RemoveAssignedInstrumentFromCallArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.call.removeAssignedInstrumentFromCall(
        context.user,
        args
      ),
      CallResponseWrap
    );
  }

  @Mutation(() => CallResponseWrap)
  assignProposalWorkflowToCall(
    @Arg('assignProposalWorkflowToCallInput')
    assignProposalWorkflowToCallInput: AssignOrRemoveProposalWorkflowToCallInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.call.assignProposalWorkflowToCall(
        context.user,
        assignProposalWorkflowToCallInput
      ),
      CallResponseWrap
    );
  }

  @Mutation(() => CallResponseWrap)
  removeAssignedProposalWorkflowtFromCall(
    @Arg('removeAssignedProposalWorkflowFromCallInput')
    removeAssignedProposalWorkflowFromCallInput: AssignOrRemoveProposalWorkflowToCallInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.call.removeAssignedProposalWorkflowFromCall(
        context.user,
        removeAssignedProposalWorkflowFromCallInput
      ),
      CallResponseWrap
    );
  }
}
