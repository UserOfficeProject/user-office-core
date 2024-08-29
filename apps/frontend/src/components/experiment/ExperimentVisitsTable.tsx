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
    },
    {
      title: 'Teamleader',
      render: (rowData: RowType) =>
        rowData.userId === scheduledEvent.visit?.teamLead.id ? 'Yes' : 'No',
    },
    {
      title: 'Starts at',
      field: 'rowData.startsAt',
      render: (rowData: RowType) =>
        rowData.isRegistrationSubmitted
          ? toFormattedDateTime(rowData.startsAt)
          : 'Unfinished',
    },
    {
      title: 'Ends at',
      field: 'rowData.endsAt',
      render: (rowData: RowType) =>
        rowData.isRegistrationSubmitted
          ? toFormattedDateTime(rowData.endsAt)
          : 'Unfinished',
    },
    {
      title: 'Training',
      field: 'rowData.trainingStatus',
      render: (rowData: RowType) => getHumanReadableStatus(rowData),
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
