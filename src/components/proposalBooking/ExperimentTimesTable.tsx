import MaterialTable, { Column, Options } from '@material-table/core';
import React from 'react';

import { ProposalScheduledEvent } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { tableIcons } from 'utils/materialIcons';
import {
  parseTzLessDateTime,
  TZ_LESS_DATE_TIME_LOW_PREC_FORMAT,
} from 'utils/Time';
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
    field: 'startsAt',
    render: (rowData) =>
      parseTzLessDateTime(rowData.startsAt).toFormat(
        TZ_LESS_DATE_TIME_LOW_PREC_FORMAT
      ),
  },
  {
    title: 'Ends at',
    field: 'endsAt',
    render: (rowData) =>
      parseTzLessDateTime(rowData.endsAt).toFormat(
        TZ_LESS_DATE_TIME_LOW_PREC_FORMAT
      ),
  },
];

export default function ExperimentsTable({
  title,
  isLoading,
  proposalScheduledEvents,
  options,
}: ExperimentTimesTableProps) {
  return (
    <MaterialTable
      icons={tableIcons}
      title={title}
      isLoading={isLoading}
      columns={columns}
      data={proposalScheduledEvents}
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
