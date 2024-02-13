import { Ctx, InputType, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewMeeting } from '../types/ReviewMeeting';

@InputType()
@Resolver()
export class ReviewMeetingQuery {
  @Query(() => [ReviewMeeting])
  reviewMeetings(@Ctx() context: ResolverContext) {
    return context.queries.reviewMeeting.getReviewMeetings(context.user);
  }
}
