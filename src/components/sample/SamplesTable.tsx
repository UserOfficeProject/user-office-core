import MaterialTable, { MaterialTableProps } from 'material-table';
import React from 'react';

import { SampleBasic } from 'models/Sample';
import { tableIcons } from 'utils/materialIcons';

const columns = [
  { title: 'Title', field: 'title' },
  { title: 'Status', field: 'safetyStatus' },
  { title: 'Created', field: 'created' },
];

function SamplesTable(props: Omit<MaterialTableProps<SampleBasic>, 'columns'>) {
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
