import { Arg, Ctx, InputType, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewMeeting } from '../types/ReviewMeeting';

@InputType()
@Resolver()
export class ReviewMeetingQuery {
  @Query(() => ReviewMeeting, { nullable: true })
  reviewMeeting(
    @Ctx() context: ResolverContext,
    @Arg('reviewMeetingId', () => Int) reviewMeetingId: number
  ) {
    return context.queries.reviewMeeting.getReviewMeeting(
      context.user,
      reviewMeetingId
    );
  }
}
