import MaterialTable, {
  Column,
  Query,
  QueryResult,
} from '@material-table/core';
import { Visibility } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Experiment, SettingsId } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
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

  React.useEffect(() => {
    setSelectedExperiment(
      tableData.find(
        (experiment) =>
          experiment.experimentId.toString() == selectedExperimentId
      )
    );
  }, [selectedExperimentId, tableData]);

  React.useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      refreshTableData();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(experimentsFilter)]);

  const { toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
    settingsFormatToUse: SettingsId.DATE_FORMAT,
  });

  const fetchExperimentsData = (tableQuery: Query<Experiment>) =>
    new Promise<QueryResult<Experiment>>((resolve, reject) => {
      try {
        const [orderBy] = tableQuery.orderByCollection;
        const {
          callId,
          instrumentId,
          experimentSafetyStatusId,
          experimentStartDate,
          experimentEndDate,
        } = experimentsFilter;
        api()
          .getExperiments({
            filter: {
              callId,
              instrumentId,
              experimentSafetyStatusId,
              // Type assertion to tell TypeScript these fields are valid
              ...(experimentStartDate ? { experimentStartDate } : {}),
              ...(experimentEndDate ? { experimentEndDate } : {}),
            },
            sortField: orderBy?.orderByField,
            sortDirection: orderBy?.orderDirection,
            first: tableQuery.pageSize,
            offset: tableQuery.page * tableQuery.pageSize,
            searchText: tableQuery.search,
          })
          .then(({ allExperiments }) => {
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
                      checked: selection.has(
                        experiment.experimentPk.toString()
                      ),
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
          })
          .catch((error) => {
            reject(error);
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
          initialPage: search ? 0 : page ? +page : 0,
        }}
        onSearchChange={(searchText) => {
          setSearchParams((searchParams) => {
            if (searchText) {
              searchParams.set('search', searchText);
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
