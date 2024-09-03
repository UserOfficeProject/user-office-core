import MaterialTable from '@material-table/core';
import Box from '@mui/material/Box';
import React from 'react';

import { GetScheduledEventsCoreQuery, TrainingStatus } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { tableIcons } from 'utils/materialIcons';
import { getFullUserName } from 'utils/user';

type RowType = NonNullable<
  GetScheduledEventsCoreQuery['scheduledEventsCore'][0]['visit']
>['registrations'][0];

type ScheduledEvent = GetScheduledEventsCoreQuery['scheduledEventsCore'][0];

interface ScheduledEventDetailsTableProps {
  scheduledEvent: ScheduledEvent;
}

function ExperimentVisitsTable({
  scheduledEvent,
}: ScheduledEventDetailsTableProps) {
  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });

  const getHumanReadableStatus = (rowData: RowType) => {
    switch (rowData.trainingStatus) {
      case TrainingStatus.ACTIVE:
        return `Valid until ${toFormattedDateTime(rowData.trainingExpiryDate)}`;
      case TrainingStatus.EXPIRED:
        return `Expired ${toFormattedDateTime(rowData.trainingExpiryDate)}`;
      case TrainingStatus.NONE:
        return 'Not started';
      default:
        return 'Unknown';
    }
  };

  const columns = [
    {
      title: 'Visitor name',
      render: (rowData: RowType) => getFullUserName(rowData.user),
      customSort: (a: RowType, b: RowType) => {
        return getFullUserName(a.user).localeCompare(getFullUserName(b.user));
      },
    },
    {
      title: 'Teamleader',
      render: (rowData: RowType) =>
        rowData.userId === scheduledEvent.visit?.teamLead.id ? 'Yes' : 'No',
      customSort: (a: RowType) => {
        return a.userId === scheduledEvent.visit?.teamLead.id ? -1 : 1;
      },
    },
    {
      title: 'Starts at',
      field: 'rowData.startsAt',
      render: (rowData: RowType) =>
        rowData.isRegistrationSubmitted
          ? toFormattedDateTime(rowData.startsAt)
          : 'Unfinished',
      customSort: (a: RowType, b: RowType) => {
        const aIsUnfinished = !a.isRegistrationSubmitted;
        const bIsUnfinished = !b.isRegistrationSubmitted;

        if (aIsUnfinished === bIsUnfinished) {
          if (!aIsUnfinished) {
            return a.startsAt.localeCompare(b.startsAt);
          } else {
            return 0;
          }
        }

        return aIsUnfinished ? (bIsUnfinished ? 0 : 1) : bIsUnfinished ? -1 : 0;
      },
    },
    {
      title: 'Ends at',
      field: 'rowData.endsAt',
      render: (rowData: RowType) =>
        rowData.isRegistrationSubmitted
          ? toFormattedDateTime(rowData.endsAt)
          : 'Unfinished',
      customSort: (a: RowType, b: RowType) => {
        const aIsUnfinished = !a.isRegistrationSubmitted;
        const bIsUnfinished = !b.isRegistrationSubmitted;

        if (aIsUnfinished === bIsUnfinished) {
          if (!aIsUnfinished) {
            return a.endsAt.localeCompare(b.endsAt);
          } else {
            return 0;
          }
        }

        return aIsUnfinished ? (bIsUnfinished ? 0 : 1) : bIsUnfinished ? -1 : 0;
      },
    },
    {
      title: 'Training',
      field: 'rowData.trainingStatus',
      render: (rowData: RowType) => getHumanReadableStatus(rowData),
      customSort: (a: RowType, b: RowType) => {
        return a.trainingExpiryDate?.localeCompare(b.trainingExpiryDate) || 0;
      },
    },
  ];

  if (scheduledEvent.visit === null) {
    return (
      <Box sx={{ textAlign: 'center', padding: '20px' }}>
        Visit is not defined
      </Box>
    );
  }

  return (
    <Box
      sx={{
        '& tr:last-child td': {
          border: 'none',
        },
        '& .MuiPaper-root': {
          padding: '0 40px',
          backgroundColor: '#fafafa',
        },
      }}
    >
      <MaterialTable
        title=""
        icons={tableIcons}
        columns={columns}
        data={scheduledEvent.visit.registrations}
        options={{
          search: false,
          paging: false,
          toolbar: false,
          headerStyle: { backgroundColor: '#fafafa', fontWeight: 'bolder' },
          pageSize: 20,
          padding: 'dense',
        }}
        data-cy="visit-registrations-table"
      />
    </Box>
  );
}

export default ExperimentVisitsTable;
