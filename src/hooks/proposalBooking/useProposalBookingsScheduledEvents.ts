import { useEffect, useState } from 'react';

import { ScheduledEvent, Proposal } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { toTzLessDateTime } from 'utils/Time';

export type ProposalScheduledEvent = Pick<
  ScheduledEvent,
  'startsAt' | 'endsAt'
> & {
  proposal: Pick<Proposal, 'id' | 'title' | 'shortCode'>;
};

export function useProposalBookingsScheduledEvents(onlyUpcoming?: boolean) {
  const [proposalScheduledEvents, setProposalScheduledEvents] = useState<
    ProposalScheduledEvent[]
  >([]);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);
    api()
      .getUserProposalBookingsWithEvents({
        ...(onlyUpcoming ? { endsAfter: toTzLessDateTime(new Date()) } : null),
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.me?.proposals) {
          const proposalScheduledEvent: ProposalScheduledEvent[] = [];
          data.me?.proposals.forEach((proposal) =>
            proposal.proposalBooking?.scheduledEvents.forEach(
              (scheduledEvent) => {
                proposalScheduledEvent.push({
                  startsAt: scheduledEvent.startsAt,
                  endsAt: scheduledEvent.endsAt,
                  proposal: {
                    id: proposal.id,
                    title: proposal.title,
                    shortCode: proposal.shortCode,
                  },
                });
              }
            )
          );

          setProposalScheduledEvents(proposalScheduledEvent);
        }

        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [onlyUpcoming, api]);

  return { loading, proposalScheduledEvents };
}
