import MaterialTable, { MaterialTableProps, Column } from 'material-table';
import React from 'react';
import { DecodedValueMap, SetQuery, QueryParamConfig } from 'use-query-params';

import { SampleBasic } from 'models/Sample';
import { tableIcons } from 'utils/materialIcons';

const defaultColumns: Column<SampleBasic>[] = [
  { title: 'Title', field: 'title' },
  { title: 'Status', field: 'safetyStatus' },
  { title: 'Created', field: 'created' },
];

type SamplesTableQueryParamsType = {
  call: QueryParamConfig<number | null | undefined>;
  search: QueryParamConfig<string | null | undefined>;
};

const SamplesTable = (
  props: Omit<MaterialTableProps<SampleBasic>, 'columns'> & {
    urlQueryParams: DecodedValueMap<SamplesTableQueryParamsType>;
    setUrlQueryParams: SetQuery<SamplesTableQueryParamsType>;
    columns?: Column<SampleBasic>[];
  }
) => (
  <MaterialTable
    columns={props.columns ? props.columns : defaultColumns}
    icons={tableIcons}
    title="Samples"
    onSearchChange={(searchText) => {
      props.setUrlQueryParams({
        search: searchText ? searchText : undefined,
      });
    }}
    options={{
      ...props.options,
      searchText: props.urlQueryParams.search || undefined,
    }}
    {...props}
  />
);

export default React.memo(
  SamplesTable,
  (prevProps, nextProps) =>
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.data === nextProps.data
);
