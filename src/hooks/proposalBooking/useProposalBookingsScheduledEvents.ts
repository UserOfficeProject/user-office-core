import { useEffect, useState } from 'react';

import {
  EsiFragment,
  Instrument,
  Maybe,
  Proposal,
  ProposalBookingStatusCore,
  ScheduledEventCore,
  Visit,
  VisitFragment,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';
import { toTzLessDateTime } from 'utils/Time';

import {
  BasicUserDetailsFragment,
  ShipmentFragment,
} from './../../generated/sdk';

export type ProposalScheduledEvent = Pick<
  ScheduledEventCore,
  'startsAt' | 'endsAt' | 'id'
> & {
  proposal: Pick<
    Proposal,
    | 'primaryKey'
    | 'title'
    | 'proposalId'
    | 'finalStatus'
    | 'managementDecisionSubmitted'
  > & {
    proposer: BasicUserDetailsFragment | null;
  } & {
    users: BasicUserDetailsFragment[];
  };
  instrument: Pick<Instrument, 'id' | 'name'> | null;
} & {
  visit:
    | (VisitFragment & {
        registrations: VisitRegistrationCore[];
        shipments: ShipmentFragment[];
      } & Pick<Visit, 'teamLead'>)
    | null;
} & { esi: Maybe<EsiFragment> };

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
          ? [
              ProposalBookingStatusCore.ACTIVE,
              ProposalBookingStatusCore.COMPLETED,
            ]
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
            proposal.proposalBookingCore?.scheduledEvents.forEach(
              (scheduledEvent) => {
                proposalScheduledEvent.push({
                  id: scheduledEvent.id,
                  startsAt: scheduledEvent.startsAt,
                  endsAt: scheduledEvent.endsAt,
                  proposal: {
                    primaryKey: proposal.primaryKey,
                    title: proposal.title,
                    proposalId: proposal.proposalId,
                    proposer: proposal.proposer,
                    users: proposal.users,
                    finalStatus: proposal.finalStatus,
                    managementDecisionSubmitted:
                      proposal.managementDecisionSubmitted,
                  },
                  instrument: proposal.instrument,
                  visit: scheduledEvent.visit,
                  esi: scheduledEvent.esi,
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

  return { loading, proposalScheduledEvents, setProposalScheduledEvents };
}
