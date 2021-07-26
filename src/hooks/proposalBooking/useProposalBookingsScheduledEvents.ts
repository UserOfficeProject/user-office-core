import { useEffect, useState } from 'react';

import {
  ScheduledEvent,
  Proposal,
  ProposalBookingStatus,
  Instrument,
  VisitFragment,
  Questionary,
  Maybe,
  Visit,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { RegistrationBasic } from 'models/VisitSubmissionState';
import { toTzLessDateTime } from 'utils/Time';

import {
  BasicUserDetailsFragment,
  ShipmentFragment,
} from './../../generated/sdk';

export type ProposalScheduledEvent = Pick<
  ScheduledEvent,
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
  } & {
    riskAssessmentQuestionary: Maybe<Pick<Questionary, 'questionaryId'>>;
  };
  instrument: Pick<Instrument, 'id' | 'name'> | null;
} & {
  visit:
    | (VisitFragment & {
        registrations: RegistrationBasic[];
        shipments: ShipmentFragment[];
      } & Pick<Visit, 'teamLead'>)
    | null;
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
                  id: scheduledEvent.id,
                  startsAt: scheduledEvent.startsAt,
                  endsAt: scheduledEvent.endsAt,
                  proposal: {
                    primaryKey: proposal.primaryKey,
                    title: proposal.title,
                    proposalId: proposal.proposalId,
                    proposer: proposal.proposer,
                    users: proposal.users,
                    riskAssessmentQuestionary:
                      proposal.riskAssessmentQuestionary,
                    finalStatus: proposal.finalStatus,
                    managementDecisionSubmitted:
                      proposal.managementDecisionSubmitted,
                  },
                  instrument: proposal.instrument,
                  visit: scheduledEvent.visit,
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
