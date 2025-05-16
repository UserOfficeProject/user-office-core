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

import ExperimentReviewContent, {
  EXPERIMENT_MODAL_TAB_NAMES,
} from './ExperimentReviewContent';
import ExperimentReviewModal from './ExperimentReviewModal';

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
  const { api } = useDataApiWithFeedback();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tableData, setTableData] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment>();

  const search = searchParams.get('search');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const selectedExperimentId = searchParams.get('experiment');

  React.useEffect(() => {
    setSelectedExperiment(
      tableData.find(
        (experiment) =>
          experiment.experimentId.toString() == selectedExperimentId
      )
    );
  }, [selectedExperimentId, tableData]);

  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const fetchExperimentsData = (tableQuery: Query<Experiment>) =>
    new Promise<QueryResult<Experiment>>(async (resolve, reject) => {
      try {
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

  const experimentReviewTabs = [
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_INFORMATION,
    EXPERIMENT_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_FORM,
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_REVIEW,
    EXPERIMENT_MODAL_TAB_NAMES.VISIT,
  ];

  return (
    <>
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
    </>
  );
}
