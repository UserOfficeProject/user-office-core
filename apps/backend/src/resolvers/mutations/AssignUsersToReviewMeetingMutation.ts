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

@ArgsType()
export class AssignUsersToReviewMeetingArgs {
  @Field(() => [Int])
  public usersIds: number[];

  @Field(() => Int)
  public reviewMeetingId: number;
}

@ArgsType()
export class RemoveUserFromReviewMeetingArgs {
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public reviewMeetingId: number;
}

@Resolver()
export class AssignUsersToReviewMeetingMutation {
  @Mutation(() => Boolean)
  async assignUsersToReviewMeeting(
    @Args() args: AssignUsersToReviewMeetingArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.reviewMeeting.assignParticipants(
      context.user,
      args
    );
  }

  @Mutation(() => Boolean)
  async removeUserFromReviewMeeting(
    @Args() args: RemoveUserFromReviewMeetingArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.reviewMeeting.removeParticipant(
      context.user,
      args
    );
  }
}
