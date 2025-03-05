import MaterialTable, {
  MaterialTableProps,
  Column,
} from '@material-table/core';
import { Typography } from '@mui/material';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { SampleWithProposalData } from 'models/questionary/sample/SampleWithProposalData';
import { tableIcons } from 'utils/materialIcons';

const defaultColumns: Column<SampleWithProposalData>[] = [
  { title: 'Title', field: 'title' },
  { title: 'Status', field: 'safetyStatus' },
  { title: 'Created', field: 'created' },
];

const ExperimentSafetyFormsTable = (
  props: Omit<MaterialTableProps<SampleWithProposalData>, 'columns'> & {
    columns?: Column<SampleWithProposalData>[];
  }
) => {
  const [searchParam, setSearchParam] = useSearchParams();
  const search = searchParam.get('search');

  return (
    <div data-cy="experiment-safety-forms-table">
      <MaterialTable
        columns={props.columns ? props.columns : defaultColumns}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Experiment Safety Forms
          </Typography>
        }
        onSearchChange={(searchText) => {
          setSearchParam((searchParam) => {
            searchParam.set('search', searchText);

            return searchParam;
          });
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
  ExperimentSafetyFormsTable,
  (prevProps, nextProps) =>
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.data === nextProps.data
);
