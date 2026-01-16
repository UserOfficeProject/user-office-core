import MaterialTable, {
  Column,
  Query,
  QueryResult,
} from '@material-table/core';
import { Visibility } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Experiment, PaginationSortDirection, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { setSortDirectionOnSortField } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ExperimentReviewContent, {
  EXPERIMENT_MODAL_TAB_NAMES,
} from './ExperimentReviewContent';
import ExperimentReviewModal from './ExperimentReviewModal';
import { ExperimentsFilter } from './ExperimentsPage';

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
            searchParams.set('experiment', rowData.experimentId.toString());

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
  const tableRef = React.useRef<MaterialTable<Experiment>>();

  const { api } = useDataApiWithFeedback();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tableData, setTableData] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment>();

  const search = searchParams.get('search');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const selectedExperimentId = searchParams.get('experiment');
  const refreshTableData = () => {
    tableRef.current?.onQueryChange({});
  };

  const isFirstRender = useRef(true);

  React.useEffect(() => {
    setSelectedExperiment(
      tableData.find(
        (experiment) =>
          experiment.experimentId.toString() == selectedExperimentId
      )
    );
  }, [selectedExperimentId, tableData]);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }
    refreshTableData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(experimentsFilter)]);

  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const fetchExperimentsData = (tableQuery: Query<Experiment>) =>
    new Promise<QueryResult<Experiment>>(async (resolve, reject) => {
      try {
        const [orderBy] = tableQuery.orderByCollection;
        const {
          callId,
          instrumentId,
          experimentSafetyStatusId,
          experimentStartDate,
          experimentEndDate,
        } = experimentsFilter;
        const { allExperiments } = await api().getExperiments({
          filter: {
            callId,
            instrumentId,
            experimentSafetyStatusId,
            // Type assertion to tell TypeScript these fields are valid
            ...(experimentStartDate ? { experimentStartDate } : {}),
            ...(experimentEndDate ? { experimentEndDate } : {}),
          },
          sortField: orderBy?.orderByField,
          sortDirection:
            orderBy?.orderDirection == PaginationSortDirection.ASC
              ? PaginationSortDirection.ASC
              : orderBy?.orderDirection == PaginationSortDirection.DESC
                ? PaginationSortDirection.DESC
                : undefined,
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
  const sortDirection = searchParams.get('sortDirection');

  columns = setSortDirectionOnSortField(
    columns,
    searchParams.get('sortField'),
    sortDirection == PaginationSortDirection.ASC
      ? PaginationSortDirection.ASC
      : sortDirection == PaginationSortDirection.DESC
        ? PaginationSortDirection.DESC
        : undefined
  );

  const experimentReviewTabs = [
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_INFORMATION,
    EXPERIMENT_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_FORM,
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_REVIEW,
    EXPERIMENT_MODAL_TAB_NAMES.VISIT,
  ];

  return (
    <div data-cy="experiments-table">
      <MaterialTable
        tableRef={tableRef}
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
          initialPage: page ? +page : 0,
        }}
        onRowsPerPageChange={(pageSize) => {
          setSearchParams((searchParams) => {
            searchParams.set('pageSize', pageSize.toString());
            searchParams.set('page', '0');

            return searchParams;
          });
        }}
        onSearchChange={(searchText) => {
          setSearchParams((searchParams) => {
            if (searchText) {
              searchParams.set('search', searchText);
              searchParams.set('page', '0');
            } else {
              searchParams.delete('search');
            }

            return searchParams;
          });
        }}
        onPageChange={(page) => {
          setSearchParams((searchParams) => {
            searchParams.set('page', page.toString());

            return searchParams;
          });
        }}
        onOrderCollectionChange={(orderByCollection) => {
          const [orderBy] = orderByCollection;

          if (!orderBy) {
            setSearchParams((searchParams) => {
              searchParams.delete('sortField');
              searchParams.delete('sortDirection');

              return searchParams;
            });
          } else {
            setSearchParams((searchParams) => {
              searchParams.set('sortField', orderBy.orderByField);
              searchParams.set('sortDirection', orderBy.orderDirection);

              return searchParams;
            });
          }
        }}
      />

      {selectedExperiment && (
        <ExperimentReviewModal
          title={`View Experiment: ${selectedExperiment?.experimentId} - (${toFormattedDateTime(selectedExperiment?.startsAt)} - ${toFormattedDateTime(selectedExperiment?.endsAt)})`}
          modalOpen={!!selectedExperiment}
          handleClose={() => {
            setSearchParams((searchParams) => {
              searchParams.delete('experiment');

              return searchParams;
            });
          }}
        >
          <ExperimentReviewContent
            experimentPk={selectedExperiment.experimentPk}
            tabNames={experimentReviewTabs}
            isInsideModal={true}
          />
        </ExperimentReviewModal>
      )}
    </div>
  );
}
