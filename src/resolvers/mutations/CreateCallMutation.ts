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
  public startCall: string;

  @Field()
  public endCall: string;

  @Field()
  public startReview: string;

  @Field()
  public endReview: string;

  @Field()
  public startNotify: string;

  @Field()
  public endNotify: string;

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
