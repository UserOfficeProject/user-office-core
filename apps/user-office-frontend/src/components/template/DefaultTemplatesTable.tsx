import { Column } from '@material-table/core';
import React, { useCallback } from 'react';

import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm from 'utils/withConfirm';

import TemplatesTable, {
  TemplateRowDataType,
  TemplatesTableProps,
} from './TemplatesTable';

export interface DefaultTemplatesTableProps
  extends Omit<
    TemplatesTableProps,
    'isRowRemovable' | 'columns' | 'dataProvider'
  > {
  isArchived: boolean;
  itemCountLabel?: string;
  isRowRemovable?: TemplatesTableProps['isRowRemovable'];
  columns?: TemplatesTableProps['columns'];
  dataProvider?: TemplatesTableProps['dataProvider'];
}

function DefaultTemplatesTable(props: DefaultTemplatesTableProps) {
  const { isArchived, templateGroup } = props;
  const { api } = useDataApiWithFeedback();

  const defaultIsRowRemovable = () => true;

  // NOTE: Here we keep the columns inside the component just because of the itemCountLabel shown in the title
  const defaultColumns: Column<TemplateRowDataType>[] = [
    { title: 'Name', field: 'name' },
    { title: 'Description', field: 'description' },
    {
      title: props.itemCountLabel ?? '# questionaries',
      field: 'questionaryCount',
    },
  ];

  const defaultDataProvider = useCallback(
    () =>
      api()
        .getTemplates({
          filter: { group: templateGroup, isArchived },
        })
        .then(({ templates }) => templates ?? []),
    [api, isArchived, templateGroup]
  );

  return (
    <TemplatesTable
      {...props}
      columns={props.columns ?? defaultColumns}
      isRowRemovable={props.isRowRemovable ?? defaultIsRowRemovable}
      dataProvider={props.dataProvider ?? defaultDataProvider}
    />
  );
}

export default withConfirm(DefaultTemplatesTable);
