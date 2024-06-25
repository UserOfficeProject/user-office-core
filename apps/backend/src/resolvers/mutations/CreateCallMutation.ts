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
import { Call } from '../types/Call';

@InputType()
export class CreateCallInput {
  @Field()
  public shortCode: string;

  @Field()
  public startCall: Date;

  @Field()
  public endCall: Date;

  @Field(() => Date, { nullable: true })
  public endCallInternal?: Date;

  @Field()
  public needTechReview: boolean;

  @Field()
  public startReview: Date;

  @Field()
  public endReview: Date;

  @Field(() => Date, { nullable: true })
  public startFapReview?: Date;

  @Field(() => Date, { nullable: true })
  public endFapReview?: Date;

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

  @Field(() => [Int], { nullable: true })
  public faps?: number[];

  @Field(() => Int, { nullable: true })
  public pdfTemplateId?: number;
}

@Resolver()
export class CreateCallMutation {
  @Mutation(() => Call)
  createCall(
    @Arg('createCallInput')
    createCallInput: CreateCallInput,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.call.create(context.user, createCallInput);
  }
}
