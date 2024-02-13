import {
  Args,
  ArgsType,
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewMeeting } from '../types/ReviewMeeting';

@ArgsType()
export class CreateReviewMeetingArgs {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public details: string;

  @Field(() => Date)
  public occursAt: Date;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Int)
  public instrumentId: number;
}

@Resolver()
export class CreateReviewMeetingMutation {
  @Mutation(() => ReviewMeeting)
  async createReviewMeeting(
    @Args() args: CreateReviewMeetingArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.reviewMeeting.create(context.user, args);
  }
}
