import { GetUserProposalBookingsWithEventsQuery } from 'generated/sdk';

export type VisitRegistrationCore = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<GetUserProposalBookingsWithEventsQuery['me']>['proposals']
    >[0]['proposalBookingsCore']
  >['scheduledEvents'][0]['visit']
>['registrations'][0];
