import MaterialTable from '@material-table/core';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { EventLog } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useEventLogsData } from 'hooks/eventLog/useEventLogsData';
import { tableIcons } from 'utils/materialIcons';

type EventLogListProps = {
  /** Id of the changed object that we want to list event logs for. */
  changedObjectId?: string | number;
  /** Type of the event we want to list.
   * For example `PROPOSAL`(get all proposal events) or
   * `PROPOSAL_UPDATED`(get all proposal updated events).
   * There is a support for multiple events like: `USER | EMAIL_INVITE` (get all user events and email invite events on that specific user)
   **/
  eventType?: string;
};

const columns = [
  {
    title: 'Changed by',
    render: (rowData: EventLog): string =>
      `${rowData.changedBy.firstname} ${rowData.changedBy.lastname}`,
  },
  {
    title: 'Changed on',
    field: 'changedOnFormatted',
  },
  { title: 'Event type', field: 'eventType' },
];

const EventLogList: React.FC<EventLogListProps> = ({
  changedObjectId = '*',
  eventType = '*',
}) => {
  const { loading, eventLogsData } = useEventLogsData(
    eventType,
    changedObjectId.toString()
  );
  const { toFormattedDateTime } = useFormattedDateTime();

  const eventLogsDataWithFormattedDates = eventLogsData.map((eventLog) => ({
    ...eventLog,
    changedOnFormatted: toFormattedDateTime(eventLog.eventTStamp),
  }));

  return (
    <div data-cy="event-logs-table">
      <MaterialTable
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Event logs
          </Typography>
        }
        columns={columns}
        data={eventLogsDataWithFormattedDates}
        isLoading={loading}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />
    </div>
  );
};

EventLogList.propTypes = {
  changedObjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  eventType: PropTypes.string,
};

export default EventLogList;
