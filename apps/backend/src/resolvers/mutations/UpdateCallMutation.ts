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
import { Call } from '../types/Call';

@InputType()
export class UpdateCallInput {
  @Field(() => Int)
  public id: number;

  @Field(() => String, { nullable: true })
  public shortCode?: string;

  @Field(() => Date, { nullable: true })
  public startCall?: Date;

  @Field(() => Date, { nullable: true })
  public endCall?: Date;

  @Field(() => Date, { nullable: true })
  public endCallInternal?: Date;

  @Field(() => Date, { nullable: true })
  public startReview?: Date;

  @Field(() => Date, { nullable: true })
  public endReview?: Date;

  @Field(() => Date, { nullable: true })
  public startFapReview?: Date;

  @Field(() => Date, { nullable: true })
  public endFapReview?: Date;

  @Field(() => Date, { nullable: true })
  public startNotify?: Date;

  @Field(() => Date, { nullable: true })
  public endNotify?: Date;

  @Field(() => Date, { nullable: true })
  public startCycle?: Date;

  @Field(() => Date, { nullable: true })
  public endCycle?: Date;

  @Field({ nullable: true })
  public referenceNumberFormat?: string;

  @Field(() => Int, { nullable: true })
  public proposalSequence?: number;

  @Field(() => String, { nullable: true })
  public cycleComment?: string;

  @Field(() => String, { nullable: true })
  public submissionMessage?: string;

  @Field(() => String, { nullable: true })
  public surveyComment?: string;

  @Field(() => AllocationTimeUnits, { nullable: true })
  public allocationTimeUnit?: AllocationTimeUnits;

  @Field(() => Int, { nullable: true })
  public proposalWorkflowId?: number;

  @Field({ nullable: true })
  public callEnded?: boolean;

  @Field({ nullable: true })
  public callEndedInternal?: boolean;

  @Field(() => Boolean, { nullable: true })
  public callReviewEnded?: boolean;

  @Field(() => Boolean, { nullable: true })
  public callFapReviewEnded?: boolean;

  @Field(() => Int, { nullable: true })
  public templateId?: number;

  @Field(() => Int, { nullable: true })
  public esiTemplateId?: number;

  @Field(() => Int, { nullable: true })
  public pdfTemplateId?: number;

  @Field(() => Int, { nullable: true })
  public fapReviewTemplateId?: number;

  @Field(() => Int, { nullable: true })
  public technicalReviewTemplateId?: number;

  @Field({ nullable: true })
  public title?: string;

  @Field({ nullable: true })
  public description?: string;

  @Field(() => [Int!], { nullable: true })
  public faps?: number[];

  @Field(() => Boolean, { nullable: true })
  public isActive?: boolean;
}

@InputType()
export class InstrumentFapMappingInput {
  @Field(() => Int)
  instrumentId: number;

  @Field(() => Int, { nullable: true })
  fapId?: number;
}

@InputType()
export class AssignInstrumentsToCallInput {
  @Field(() => [InstrumentFapMappingInput])
  instrumentFapIds: InstrumentFapMappingInput[];

  @Field(() => Int)
  callId: number;
}

@InputType()
export class UpdateFapToCallInstrumentInput {
  @Field(() => Int)
  instrumentId: number;

  @Field(() => Int)
  callId: number;

  @Field(() => Int, { nullable: true })
  fapId?: number;
}

@InputType()
export class RemoveFapFromCallInstrumentsInput {
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
  @Mutation(() => Call)
  updateCall(
    @Arg('updateCallInput')
    updateCallInput: UpdateCallInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.call.update(context.user, updateCallInput);
  }

  //todo: Create test case
  @Mutation(() => Call)
  assignInstrumentsToCall(
    @Arg('assignInstrumentsToCallInput')
    assignInstrumentsToCallInput: AssignInstrumentsToCallInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.call.assignInstrumentsToCall(
      context.user,
      assignInstrumentsToCallInput
    );
  }

  @Mutation(() => Call)
  updateFapToCallInstrument(
    @Arg('updateFapToCallInstrumentInput')
    updateFapToCallInstrumentInput: UpdateFapToCallInstrumentInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.call.updateFapToCallInstrument(
      context.user,
      updateFapToCallInstrumentInput
    );
  }

  @Mutation(() => Call)
  removeAssignedInstrumentFromCall(
    @Arg('removeAssignedInstrumentFromCallInput')
    removeAssignedInstrumentFromCallInput: RemoveAssignedInstrumentFromCallInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.call.removeAssignedInstrumentFromCall(
      context.user,
      removeAssignedInstrumentFromCallInput
    );
  }
}
