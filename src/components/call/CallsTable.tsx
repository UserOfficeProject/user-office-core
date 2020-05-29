import React from 'react';
import { Call } from '../../generated/sdk';
import MaterialTable, { MaterialTableProps } from 'material-table';
import dateformat from 'dateformat';
import { tableIcons } from '../../utils/materialIcons';

export function CallsTable(props: CallsTableProps) {
  const columns = [
    { title: 'Short Code', field: 'shortCode' },
    {
      title: 'Start Date',
      field: 'startCall',
      render: (rowData: TableRowType): string =>
        dateformat(new Date(rowData.startCall), 'dd-mmm-yyyy'),
    },
    {
      title: 'End Date',
      field: 'endCall',
      render: (rowData: TableRowType): string =>
        dateformat(new Date(rowData.endCall), 'dd-mmm-yyyy'),
    },
  ];

  return (
    <MaterialTable
      icons={tableIcons}
      title="Calls"
      columns={columns}
      data={props.data || []}
      {...props}
    />
  );
}

type TableRowType = Pick<Call, 'startCall' | 'endCall' | 'shortCode'>;

interface CallsTableProps extends Partial<MaterialTableProps<TableRowType>> {
  data?: TableRowType[];
}
