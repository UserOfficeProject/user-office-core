import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewMeeting } from '../types/ReviewMeeting';

@ArgsType()
export class UpdateReviewMeetingArgs {
  @Field(() => Int)
  public reviewMeetingId: number;

  @Field(() => String, { nullable: true })
  public name?: string;

  @Field(() => String, { nullable: true })
  public details?: string;

  @Field(() => Date, { nullable: true })
  public occursAt?: Date;

  @Field(() => Boolean, { nullable: true })
  public notified?: boolean;

  @Field(() => Int, { nullable: true })
  public instrumentId?: number;

  @Field(() => Int, { nullable: true })
  public creatorId?: number;
}

@Resolver()
export class UpdateReviewMeetingMutation {
  @Mutation(() => ReviewMeeting)
  updateReviewMeeting(
    @Args() args: UpdateReviewMeetingArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.reviewMeeting.update(context.user, args);
  }
}
