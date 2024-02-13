import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ReviewMeeting } from '../types/ReviewMeeting';

@Resolver()
export class DeleteReviewMeeting {
  @Mutation(() => ReviewMeeting)
  deleteReviewMeeting(
    @Arg('reviewMeetingId', () => Int) reviewMeetingId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.reviewMeeting.delete(
      context.user,
      reviewMeetingId
    );
  }
}
