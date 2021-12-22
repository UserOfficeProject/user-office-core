import { GetUserProposalBookingsWithEventsQuery } from 'generated/sdk';

export type FeedbackCore = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<GetUserProposalBookingsWithEventsQuery['me']>['proposals']
    >[0]['proposalBookingCore']
  >['scheduledEvents'][0]['feedback']
>;
