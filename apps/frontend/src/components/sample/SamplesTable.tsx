import MaterialTable, {
  MaterialTableProps,
  Column,
} from '@material-table/core';
import { Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { useTypeSafeSearchParams } from 'hooks/common/useTypeSafeSearchParams';
import { SampleWithProposalData } from 'models/questionary/sample/SampleWithProposalData';
import { tableIcons } from 'utils/materialIcons';

const defaultColumns: Column<SampleWithProposalData>[] = [
  { title: 'Title', field: 'title' },
  { title: 'Status', field: 'safetyStatus' },
  { title: 'Created', field: 'created' },
];

const SamplesTable = (
  props: Omit<MaterialTableProps<SampleWithProposalData>, 'columns'> & {
    columns?: Column<SampleWithProposalData>[];
  }
) => {
  const initialParams = useMemo(
    () => ({
      search: null,
    }),
    []
  );

  const [typedParams, setTypedParams] = useTypeSafeSearchParams<{
    search: string | null;
  }>(initialParams);

  const search = typedParams.search;

  return (
    <div data-cy="samples-table">
      <MaterialTable
        columns={props.columns ? props.columns : defaultColumns}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Samples
          </Typography>
        }
        onSearchChange={(searchText) => {
          setTypedParams((prev) => ({
            ...prev,
            search: searchText,
          }));
        }}
        options={{
          ...props.options,
          searchText: search ?? undefined,
        }}
        {...props}
      />
    </div>
  );
};

export default React.memo(
  SamplesTable,
  (prevProps, nextProps) =>
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.data === nextProps.data
);
