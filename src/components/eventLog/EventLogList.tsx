import React from 'react';
import dateformat from 'dateformat';
import MaterialTable from 'material-table';
import { useEventLogsData } from '../../hooks/useEventLogsData';
import { tableIcons } from '../../utils/materialIcons';

type EventLogListProps = {
  /** Id of the changed object that we want to list event logs for. */
  changedObjectId?: string | number;
  /** Type of the event we want to list.
   * For example `PROPOSAL`(get all proposal events) or
   * `PROPOSAL_UPDATED`(get all proposal updated events)
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
    { title: 'Event log ID', field: 'id' },
    { title: 'Changed by', field: 'changedBy.email' },
    {
      title: 'Changed on',
      field: 'eventTStamp',
      render: (rowData: any) =>
        dateformat(new Date(rowData.eventTStamp), 'dd-mmm-yyyy HH:MM:ss'),
    },
    { title: 'Event type', field: 'eventType' },
  ];

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
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
  );
};

export default EventLogList;
