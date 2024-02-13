import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
  Directive,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { ReviewMeeting as ReviewMeetingOrigin } from '../../models/ReviewMeeting';
import { BasicUserDetails } from './BasicUserDetails';
import { Instrument } from './Instrument';

@ObjectType()
@Directive('@key(fields: "id")')
export class ReviewMeeting implements Partial<ReviewMeetingOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public name: string;

  @Field()
  public details: string;

  @Field()
  public creatorId: number;

  @Field()
  public instrumentId: number;

  @Field()
  public notified: boolean;

  @Field(() => Date)
  public occursAt: Date;
}

@Resolver(() => ReviewMeeting)
export class ReviewMeetingResolver {
  @FieldResolver(() => Instrument)
  async instrument(
    @Root() meeting: ReviewMeeting,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.instrument.dataSource.getInstrument(
      meeting.instrumentId
    );
  }

  @FieldResolver(() => [BasicUserDetails])
  async participants(
    @Root() ReviewMeeting: ReviewMeeting,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails[] | null> {
    const scientists = context.queries.reviewMeeting.dataSource.getParticipants(
      ReviewMeeting.id
    );

    return isRejection(scientists) ? [] : scientists;
  }

  @FieldResolver(() => BasicUserDetails)
  async creator(
    @Root() meeting: ReviewMeeting,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.dataSource.getBasicUserInfo(meeting.creatorId);
  }
}
