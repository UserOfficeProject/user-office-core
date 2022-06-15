import MaterialTable, { Column, Options } from '@material-table/core';
import React from 'react';

import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { ProposalScheduledEvent } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

type ExperimentTimesTableProps = {
  title: string;
  isLoading: boolean;
  proposalScheduledEvents: ProposalScheduledEvent[];
  options?: Partial<Options<ProposalScheduledEvent>>;
};

const columns: Column<ProposalScheduledEvent>[] = [
  { title: 'Proposal title', field: 'proposal.title' },
  { title: 'Proposal ID', field: 'proposal.proposalId' },
  { title: 'Instrument', field: 'instrument.name' },
  {
    title: 'Local contact',
    render: (rowData) => getFullUserName(rowData.localContact),
  },
  {
    title: 'Starts at',
    field: 'startsAtFormatted',
  },
  {
    title: 'Ends at',
    field: 'endsAtFormatted',
  },
];

export default function ExperimentsTable({
  title,
  isLoading,
  proposalScheduledEvents,
  options,
}: ExperimentTimesTableProps) {
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const proposalScheduledEventsWithFormattedDates = proposalScheduledEvents.map(
    (event) => ({
      ...event,
      startsAtFormatted: toFormattedDateTime(event.startsAt),
      endsAtFormatted: toFormattedDateTime(event.endsAt),
    })
  );

  return (
    <MaterialTable
      icons={tableIcons}
      title={title}
      isLoading={isLoading}
      columns={columns}
      data={proposalScheduledEventsWithFormattedDates}
      options={{
        search: false,
        padding: 'dense',
        emptyRowsWhenPaging: false,
        paging: false,
        ...options,
      }}
    />
  );
}
