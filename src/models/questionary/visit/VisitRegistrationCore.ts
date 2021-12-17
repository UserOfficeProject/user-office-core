import { GetUserProposalBookingsWithEventsQuery } from 'generated/sdk';
import { ExcludeNull } from 'utils/utilTypes';

export type VisitRegistrationCore = ExcludeNull<
  ExcludeNull<
    ExcludeNull<
      ExcludeNull<GetUserProposalBookingsWithEventsQuery['me']>['proposals']
    >[0]['proposalBookingCore']
  >['scheduledEvents'][0]['visit']
>['registrations'][0];
