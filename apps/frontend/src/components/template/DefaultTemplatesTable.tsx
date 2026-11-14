import { Column } from '@material-table/core';
import React from 'react';

import withConfirm from 'utils/withConfirm';

import TemplatesTable, {
  TemplateRowDataType,
  TemplatesTableProps,
} from './TemplatesTable';

export interface DefaultTemplatesTableProps
  extends Omit<TemplatesTableProps, 'isRowRemovable' | 'columns'> {
  isArchived: boolean;
  itemCountLabel?: string;
  isRowRemovable?: TemplatesTableProps['isRowRemovable'];
  columns?: TemplatesTableProps['columns'];
}

function DefaultTemplatesTable(props: DefaultTemplatesTableProps) {
  const defaultIsRowRemovable = (rowData: TemplateRowDataType) =>
    rowData.questionaryCount === 0;

  // NOTE: Here we keep the columns inside the component just because of the itemCountLabel shown in the title
  const defaultColumns: Column<TemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    {
      title: props.itemCountLabel ?? '# questionaries',
      field: 'questionaryCount',
    },
  ];

  return (
    <TemplatesTable
      {...props}
      columns={props.columns ?? defaultColumns}
      isRowRemovable={props.isRowRemovable ?? defaultIsRowRemovable}
    />
  );
}

export default withConfirm(DefaultTemplatesTable);
