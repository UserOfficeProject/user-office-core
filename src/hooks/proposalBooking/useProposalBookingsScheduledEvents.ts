import { useEffect, useState } from 'react';

import { ScheduledEvent, Proposal, ProposalBookingStatus } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { toTzLessDateTime } from 'utils/Time';

import { VisitFragment } from './../../generated/sdk';

export type ProposalScheduledEvent = Pick<
  ScheduledEvent,
  'startsAt' | 'endsAt'
> & {
  proposal: Pick<Proposal, 'primaryKey' | 'title' | 'proposalId'> & {
    visits: VisitFragment[] | null;
  };
};

export function useProposalBookingsScheduledEvents({
  onlyUpcoming,
  notDraft,
  instrumentId,
}: {
  onlyUpcoming?: boolean;
  notDraft?: boolean;
  instrumentId?: number;
} = {}) {
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
        status: notDraft
          ? [ProposalBookingStatus.BOOKED, ProposalBookingStatus.CLOSED]
          : null,
        instrumentId,
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
                    primaryKey: proposal.primaryKey,
                    title: proposal.title,
                    proposalId: proposal.proposalId,
                    visits: proposal.visits,
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
  }, [onlyUpcoming, notDraft, instrumentId, api]);

  return { loading, proposalScheduledEvents };
}
