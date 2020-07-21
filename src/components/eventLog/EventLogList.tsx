import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import dateformat from 'dateformat';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React from 'react';

import { EventLog } from 'generated/sdk';
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

const EventLogList: React.FC<EventLogListProps> = ({
  changedObjectId = '*',
  eventType = '*',
}) => {
  const { loading, eventLogsData } = useEventLogsData(
    eventType,
    changedObjectId.toString()
  );
  const columns = [
    {
      title: 'Changed by',
      render: (rowData: EventLog): string =>
        `${rowData.changedBy.firstname} ${rowData.changedBy.lastname}`,
    },
    {
      title: 'Changed on',
      render: (rowData: EventLog): string =>
        dateformat(new Date(rowData.eventTStamp), 'dd-mmm-yyyy HH:MM:ss'),
    },
    { title: 'Event type', field: 'eventType' },
  ];

  if (loading) {
    return (
      <CircularProgress style={{ marginLeft: '50%', marginTop: '20px' }} />
    );
  }

  return (
    <div data-cy="event-logs-table">
      <MaterialTable
        icons={tableIcons}
        title={'Event logs'}
        columns={columns}
        data={eventLogsData}
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
