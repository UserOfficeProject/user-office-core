import MaterialTable, {
  Column,
  Query,
  QueryResult,
} from '@material-table/core';
import { Visibility } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Experiment, ExperimentsFilter, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

type ExperimentsTableProps = {
  experimentsFilter: ExperimentsFilter;
  setExperimentsFilter?: (filter: ExperimentsFilter) => void;
};

const RowActionButtons = (rowData: Experiment) => {
  const [, setSearchParams] = useSearchParams();

  return (
    <Tooltip title="View Experiment">
      <IconButton
        data-cy="view-experiment"
        onClick={() => {
          setSearchParams((searchParams) => {
            searchParams.set('reviewModal', rowData.experimentPk.toString());

            return searchParams;
          });
        }}
      >
        <Visibility />
      </IconButton>
    </Tooltip>
  );
};

export default function ExperimentsTable({
  experimentsFilter,
}: ExperimentsTableProps) {
  const { api } = useDataApiWithFeedback();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tableData, setTableData] = useState<Experiment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment>();

  const search = searchParams.get('search');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const reviewModal = searchParams.get('reviewModal');

  React.useEffect(() => {
    setSelectedExperiment(
      tableData.find(
        (experiment) => experiment.experimentPk.toString() == reviewModal
      )
    );
  }, [reviewModal, tableData]);

  const { toFormattedDateTime, format } = useFormattedDateTime({
    shouldUseTimeZone: true,
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const fetchExperimentsData = (tableQuery: Query<Experiment>) =>
    new Promise<QueryResult<Experiment>>(async (resolve, reject) => {
      try {
        console.log({ tableQuery });
        const [orderBy] = tableQuery.orderByCollection;
        const { callId } = experimentsFilter;

        const { allExperiments } = await api().getAllExperiments({
          filter: {
            callId: callId,
          },
          sortField: orderBy?.orderByField,
          sortDirection: orderBy?.orderDirection,
          first: tableQuery.pageSize,
          offset: tableQuery.page * tableQuery.pageSize,
          searchText: tableQuery.search,
        });

        const tableData =
          allExperiments?.experiments.map((experiment) => {
            const selection = new Set(searchParams.getAll('selection'));
            const experimentData = {
              ...experiment,
            } as Experiment;

            if (searchParams.getAll('selection').length > 0) {
              return {
                ...experimentData,
                tableData: {
                  checked: selection.has(experiment.experimentPk.toString()),
                },
              };
            } else {
              return experimentData;
            }
          }) || [];

        setTableData(tableData);
        setTotalCount(allExperiments?.totalCount || 0);

        resolve({
          data: tableData,
          page: tableQuery.page,
          totalCount: allExperiments?.totalCount || 0,
        });
      } catch (error) {
        reject(error);
      }
    });

  let columns: Column<Experiment>[] = [
    {
      title: 'Experiment ID',
      field: 'experimentId',
    },
    {
      title: 'Proposal ID',
      field: 'proposal.proposalId',
    },
    {
      title: 'Start',
      field: 'startsAt',
      render: (rowData: Experiment) => toFormattedDateTime(rowData.startsAt),
    },
    {
      title: 'End',
      field: 'endsAt',
      render: (rowData: Experiment) => toFormattedDateTime(rowData.endsAt),
    },
    {
      title: 'Instrument',
      field: 'instrument.name',
    },
    {
      title: 'Experiment Safety Status',
      field: 'experimentSafety.status.name',
      render: (rowData: Experiment) =>
        rowData.experimentSafety?.status?.name ?? 'ESF Not Started',
    },
  ];

  if (!columns.find((column) => column.field === 'rowActionButtons')) {
    columns = [
      {
        title: 'Actions',
        cellStyle: { padding: 0 },
        sorting: false,
        removable: false,
        field: 'rowActionButtons',
        render: RowActionButtons,
      },
      ...columns,
    ];
  }

  return (
    <MaterialTable
      title={
        <Typography variant="h6" component="h2">
          Experiments
        </Typography>
      }
      columns={columns}
      data={fetchExperimentsData}
      options={{
        searchText: search || undefined,
        pageSize: pageSize ? +pageSize : 10,
        initialPage: search ? 0 : page ? +page : 0,
      }}
      onSearchChange={(searchText) => {
        setSearchParams({
          search: searchText ? searchText : '',
          page: searchText ? '0' : page || '',
        });
      }}
      onPageChange={(page) => {
        setSearchParams((searchParams) => {
          searchParams.set('page', page.toString());

          return searchParams;
        });
      }}
    />
  );
}
