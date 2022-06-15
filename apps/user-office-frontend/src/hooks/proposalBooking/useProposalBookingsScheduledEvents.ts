import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

import {
  BasicUserDetailsFragment,
  EsiFragment,
  FeedbackFragment,
  Instrument,
  Maybe,
  Proposal,
  ProposalBookingStatusCore,
  ScheduledEventCore,
  ShipmentFragment,
  Visit,
  VisitFragment,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';

export type ProposalScheduledEvent = Pick<
  ScheduledEventCore,
  'startsAt' | 'endsAt' | 'id' | 'status' | 'localContact'
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
      } & Pick<Visit, 'teamLead'>)
    | null;
} & { esi: Maybe<EsiFragment> } & { feedback: Maybe<FeedbackFragment> } & {
  shipments: ShipmentFragment[];
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
        ...(onlyUpcoming
          ? {
              endsAfter: DateTime.now().toUTC().toISO(),
            }
          : null),
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
                  status: scheduledEvent.status,
                  localContact: scheduledEvent.localContact,
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
                  feedback: scheduledEvent.feedback,
                  shipments: scheduledEvent.shipments,
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
