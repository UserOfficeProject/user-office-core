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

  @Field()
  public cycleComment: string;

  @Field()
  public surveyComment: string;

  @Field(() => Int, { nullable: true })
  public proposalWorkflowId: number;

  @Field(() => Int, { nullable: true })
  public templateId?: number;
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
