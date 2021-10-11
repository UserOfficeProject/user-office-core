import { GetUserProposalBookingsWithEventsQuery } from 'generated/sdk';
import { ExcludeTypeName, ExcludeNull } from 'utils/utilTypes';

export type VisitRegistrationCore = ExcludeTypeName<
  ExcludeNull<
    ExcludeNull<
      ExcludeNull<
        ExcludeNull<GetUserProposalBookingsWithEventsQuery['me']>['proposals']
      >[0]['proposalBookingCore']
    >['scheduledEvents'][0]['visit']
  >['registrations'][0]
>;
