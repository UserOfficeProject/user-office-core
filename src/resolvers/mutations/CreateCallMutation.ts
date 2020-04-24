import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

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
