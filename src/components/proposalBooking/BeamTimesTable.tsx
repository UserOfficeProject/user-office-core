import MaterialTable, { Options } from 'material-table';
import React from 'react';

import { ProposalScheduledEvent } from 'hooks/proposalBooking/useProposalBookingsScheduledEvents';
import { tableIcons } from 'utils/materialIcons';
import {
  parseTzLessDateTime,
  TZ_LESS_DATE_TIME_LOW_PREC_FORMAT,
} from 'utils/Time';

type BeamTimesTableProps = {
  title: string;
  isLoading: boolean;
  proposalScheduledEvents: ProposalScheduledEvent[];
  options?: Partial<Options>;
};

export default function BeamTimesTable({
  title,
  isLoading,
  proposalScheduledEvents,
  options,
}: BeamTimesTableProps) {
  return (
    <MaterialTable
      icons={tableIcons}
      title={title}
      isLoading={isLoading}
      columns={[
        { title: 'Proposal title', field: 'proposal.title' },
        { title: 'Proposal short code', field: 'proposal.shortCode' },
        {
          title: 'Starts at',
          field: 'startsAt',
          render: (rowData) =>
            parseTzLessDateTime(rowData.startsAt).format(
              TZ_LESS_DATE_TIME_LOW_PREC_FORMAT
            ),
        },
        {
          title: 'Ends at',
          field: 'endsAt',
          render: (rowData) =>
            parseTzLessDateTime(rowData.endsAt).format(
              TZ_LESS_DATE_TIME_LOW_PREC_FORMAT
            ),
        },
      ]}
      data={proposalScheduledEvents}
      options={{
        search: false,
        selection: false,
        padding: 'dense',
        emptyRowsWhenPaging: false,
        paging: false,
        ...options,
      }}
    />
  );
}
