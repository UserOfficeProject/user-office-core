import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { CallResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateCallArgs {
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
  public cycleComment: string;

  @Field()
  public surveyComment: string;

  @Field(() => Int, { nullable: true })
  public templateId?: number;
}

@Resolver()
export class CreateCallMutation {
  @Mutation(() => CallResponseWrap)
  createCall(@Args() args: CreateCallArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.call.create(context.user, args),
      CallResponseWrap
    );
  }
}
