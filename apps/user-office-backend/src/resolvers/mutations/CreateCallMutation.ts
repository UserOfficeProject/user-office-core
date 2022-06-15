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
import { AllocationTimeUnits } from '../../models/Call';
import { CallResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class CreateCallInput {
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

  @Field(() => Int)
  public templateId: number;

  @Field(() => Int, { nullable: true })
  public esiTemplateId?: number;

  @Field({ nullable: true })
  public title: string;

  @Field({ nullable: true })
  public description: string;
}

@Resolver()
export class CreateCallMutation {
  @Mutation(() => CallResponseWrap)
  createCall(
    @Arg('createCallInput')
    createCallInput: CreateCallInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.call.create(context.user, createCallInput),
      CallResponseWrap
    );
  }
}
