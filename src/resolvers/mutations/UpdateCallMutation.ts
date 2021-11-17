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
import { AllocationTimeUnits } from '../../models/Call';
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

  @Field(() => Date, { nullable: true })
  public startSEPReview?: Date;

  @Field(() => Date, { nullable: true })
  public endSEPReview?: Date;

  @Field()
  public startNotify: Date;

  @Field()
  public endNotify: Date;

  @Field()
  public startCycle: Date;

  @Field()
  public endCycle: Date;

  @Field({ nullable: true })
  public referenceNumberFormat: string;

  @Field(() => Int, { nullable: true })
  public proposalSequence: number;

  @Field()
  public cycleComment: string;

  @Field({ nullable: true })
  public submissionMessage: string;

  @Field()
  public surveyComment: string;

  @Field(() => AllocationTimeUnits)
  public allocationTimeUnit: AllocationTimeUnits;

  @Field(() => Int)
  public proposalWorkflowId: number;

  @Field(() => Int, { nullable: true })
  public callEnded?: boolean;

  @Field(() => Int, { nullable: true })
  public callReviewEnded?: boolean;

  @Field(() => Int, { nullable: true })
  public callSEPReviewEnded?: boolean;

  @Field(() => Int)
  public templateId: number;

  @Field(() => Int, { nullable: true })
  public esiTemplateId?: number;

  @Field({ nullable: true })
  public title: string;

  @Field({ nullable: true })
  public description: string;
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
