import MaterialTable, { MaterialTableProps } from 'material-table';
import React from 'react';

import { Sample } from 'generated/sdk';
import { tableIcons } from 'utils/materialIcons';

const columns = [
  { title: 'Title', field: 'title' },
  { title: 'Status', field: 'status' },
  { title: 'Created', field: 'Created' },
];

function SamplesTable(props: Omit<MaterialTableProps<Sample>, 'columns'>) {
  return (
    <MaterialTable
      icons={tableIcons}
      columns={columns}
      title="Samples"
      {...props}
    />
  );
}

export default SamplesTable;
