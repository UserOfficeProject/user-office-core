import { GetUserProposalBookingsWithEventsQuery } from 'generated/sdk';
import { ExcludeTypeName, ExcludeNull } from 'utils/utilTypes';

export type FeedbackCore = ExcludeTypeName<
  ExcludeNull<
    ExcludeNull<
      ExcludeNull<
        ExcludeNull<GetUserProposalBookingsWithEventsQuery['me']>['proposals']
      >[0]['proposalBookingCore']
    >['scheduledEvents'][0]['feedback']
  >
>;
