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
export class NotifyReviewMeetingArgs {
  @Field(() => Int)
  public reviewMeetingId: number;
  @Field(() => String)
  public templateId: string;
}

@Resolver()
export class NotifyReviewMeetingMutation {
  @Mutation(() => ReviewMeeting)
  async notifyReviewMeeting(
    @Args()
    { reviewMeetingId: reviewMeetingId, templateId }: NotifyReviewMeetingArgs,
    @Ctx() context: ResolverContext
  ) {
    const result = await context.mutations.reviewMeeting.notifyParticipants(
      context.user,
      {
        reviewMeetingId: reviewMeetingId,
        templateId,
      }
    );

    return result;
  }
}
