import MaterialTable, {
  Action,
  Column,
  Query,
  QueryResult,
} from '@material-table/core';
import { Visibility } from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useCallback, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import ListStatusIcon from 'components/common/icons/ListStatusIcon';
import RoleBasedLink from 'components/common/RoleBasedLink';
import {
  Experiment,
  ExperimentTableSortField,
  PaginationSortDirection,
  SettingsId,
  UserRole,
  WorkflowStatus,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { setSortDirectionOnSortField } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import ChangeExperimentSafetyStatus from './ChangeExperimentSafetyStatus';
import ExperimentReviewContent, {
  EXPERIMENT_MODAL_TAB_NAMES,
} from './ExperimentReviewContent';
import ExperimentReviewModal from './ExperimentReviewModal';
import { ExperimentsFilter } from './ExperimentsPage';

type ExperimentsTableProps = {
  experimentsFilter: ExperimentsFilter;
  setExperimentsFilter?: (filter: ExperimentsFilter) => void;
};

// Maps a material-table column `field` to the GraphQL sort enum.
const COLUMN_FIELD_TO_SORT_FIELD: Record<string, ExperimentTableSortField> = {
  experimentId: ExperimentTableSortField.EXPERIMENTID,
  'proposal.proposalId': ExperimentTableSortField.PROPOSALID,
  startsAt: ExperimentTableSortField.STARTSAT,
  endsAt: ExperimentTableSortField.ENDSAT,
};

const RowActionButtons = (rowData: Experiment) => {
  const [, setSearchParams] = useSearchParams();

  return (
    <Tooltip title="View Experiment">
      <IconButton
        data-cy="view-experiment"
        onClick={() => {
          setSearchParams((searchParams) => {
            searchParams.set('experiment', rowData.experimentPk.toString());

            return searchParams;
          });
        }}
      >
        <Visibility />
      </IconButton>
    </Tooltip>
  );
};

const ChangeExperimentSafetyStatusIcon = () => (
  <ListStatusIcon data-cy="change-experiment-safety-status" />
);

export default function ExperimentsTable({
  experimentsFilter,
}: ExperimentsTableProps) {
  const tableRef = React.useRef<MaterialTable<Experiment>>(undefined);

  const { api } = useDataApiWithFeedback();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const from = encodeURIComponent(location.pathname + location.search);
  const [tableData, setTableData] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment>();
  const [
    openChangeExperimentSafetyStatus,
    setOpenChangeExperimentSafetyStatus,
  ] = useState(false);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const getSelectedExperimentsData = useCallback(
    () =>
      tableData.filter((item) =>
        searchParams.getAll('selection').includes(item.experimentPk.toString())
      ),
    [tableData, searchParams]
  );

  const selectedExperimentsData = getSelectedExperimentsData();
  const search = searchParams.get('search');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const selectedExperimentPk = searchParams.get('experiment');
  const parsedExperimentPk =
    selectedExperimentPk !== null ? parseInt(selectedExperimentPk) : NaN;
  const experimentPkFromUrl = Number.isInteger(parsedExperimentPk)
    ? parsedExperimentPk
    : null;
  const refreshTableData = () => {
    tableRef.current?.onQueryChange({});
  };

  const isFirstRender = useRef(true);

  React.useEffect(() => {
    setSelectedExperiment(
      tableData.find(
        (experiment) => experiment.experimentPk === experimentPkFromUrl
      )
    );
  }, [experimentPkFromUrl, tableData]);

  // the experiment can live outside the currently loaded page of results (e.g. a
  // deep link), in which case ExperimentReviewContent fetches it by primary key
  const experimentPkToReview =
    selectedExperiment?.experimentPk ?? experimentPkFromUrl;

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
          .getAllExperiments({
            filter: {
              callId,
              instrumentId,
              experimentSafetyStatusId,
              // Type assertion to tell TypeScript these fields are valid
              ...(experimentStartDate ? { experimentStartDate } : {}),
              ...(experimentEndDate ? { experimentEndDate } : {}),
            },
            sortField: orderBy
              ? COLUMN_FIELD_TO_SORT_FIELD[orderBy.orderByField]
              : undefined,
            sortDirection:
              orderBy?.orderDirection == PaginationSortDirection.ASC
                ? PaginationSortDirection.ASC
                : orderBy?.orderDirection == PaginationSortDirection.DESC
                  ? PaginationSortDirection.DESC
                  : undefined,
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

  const tableActions: Action<Experiment>[] = [
    {
      icon: ChangeExperimentSafetyStatusIcon,
      tooltip: 'Change experiment safety status',
      onClick: () => {
        setOpenChangeExperimentSafetyStatus(true);
      },
      position: 'toolbarOnSelect',
    },
  ];

  let columns: Column<Experiment>[] = [
    {
      title: 'Experiment ID',
      field: 'experimentId',
    },
    {
      title: 'Proposal ID',
      field: 'proposal.proposalId',
      render: (rowData: Experiment) => (
        <RoleBasedLink
          roleRoutes={{
            [UserRole.USER_OFFICER]: `/Proposals?reviewModal=${rowData.proposal.primaryKey}&from=${from}`,
            [UserRole.INSTRUMENT_SCIENTIST]: `/Proposals?reviewModal=${rowData.proposal.primaryKey}&from=${from}`,
          }}
        >
          {rowData.proposal.proposalId}
        </RoleBasedLink>
      ),
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
      sorting: false,
    },
    {
      title: 'Experiment Safety Status',
      field: 'experimentSafety.status.name',
      sorting: false,
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

  // Make the status column clickable to open the workflow tree (only for user officers)
  columns = columns.map((column) => {
    if (column.field === 'experimentSafety.status.name') {
      return {
        ...column,
        render: (rowData: Experiment) =>
          isUserOfficer ? (
            <Link
              component="button"
              variant="body2"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                setSearchParams((searchParams) => {
                  searchParams.delete('selection');
                  searchParams.append(
                    'selection',
                    rowData.experimentPk.toString()
                  );

                  return searchParams;
                });
                setOpenChangeExperimentSafetyStatus(true);
              }}
            >
              {rowData.experimentSafety?.status?.name ?? 'ESF Not Started'}
            </Link>
          ) : (
            <span>
              {rowData.experimentSafety?.status?.name ?? 'ESF Not Started'}
            </span>
          ),
      };
    }

    return column;
  });

  const experimentReviewTabs = [
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_INFORMATION,
    EXPERIMENT_MODAL_TAB_NAMES.PROPOSAL_INFORMATION,
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_FORM,
    EXPERIMENT_MODAL_TAB_NAMES.EXPERIMENT_SAFETY_REVIEW,
    EXPERIMENT_MODAL_TAB_NAMES.VISIT,
  ];

  if (isUserOfficer) {
    experimentReviewTabs.push(EXPERIMENT_MODAL_TAB_NAMES.LOGS);
  }

  const changeStatusOnExperimentSafety = async (
    workflowStatus: WorkflowStatus,
    statusActionsWorkflowConnectionId?: number
  ) => {
    const selectedExperimentsData = getSelectedExperimentsData();
    const experimentSafetyPks = selectedExperimentsData
      .map((experiment) => experiment.experimentSafety?.experimentSafetyPk)
      .filter((pk): pk is number => pk !== undefined);

    if (experimentSafetyPks.length !== selectedExperimentsData.length) {
      enqueueSnackbar(
        'Cannot change status. Some or all selected experiments do not have required safety information.',
        { variant: 'error' }
      );

      return;
    }

    if (workflowStatus?.workflowStatusId && experimentSafetyPks.length) {
      const shouldAddPluralLetter = experimentSafetyPks.length > 1 ? 's' : '';
      await api({
        toastSuccessMessage: `Experiment Safety${shouldAddPluralLetter} status changed successfully!`,
      }).changeExperimentsSafetyStatus({
        experimentSafetyPks: experimentSafetyPks,
        workflowStatusId: workflowStatus.workflowStatusId,
        statusActionsWorkflowConnectionId: statusActionsWorkflowConnectionId,
      });
      refreshTableData();
    }
  };

  return (
    <div data-cy="experiments-table">
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={openChangeExperimentSafetyStatus}
        maxWidth="lg"
        onClose={(): void => setOpenChangeExperimentSafetyStatus(false)}
        fullWidth
      >
        <DialogContent>
          <ChangeExperimentSafetyStatus
            changeStatusOnExperiments={changeStatusOnExperimentSafety}
            close={(): void => setOpenChangeExperimentSafetyStatus(false)}
            selectedExperiments={selectedExperimentsData}
          />
        </DialogContent>
      </Dialog>

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
          search: true,
          debounceInterval: 600,
          searchText: search || undefined,
          selection: isUserOfficer,
          pageSize: pageSize ? +pageSize : 10,
          initialPage: page ? +page : 0,
        }}
        actions={tableActions}
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
        onSelectionChange={(selectedItems) => {
          if (selectedItems.length) {
            setSearchParams((searchParams) => {
              searchParams.delete('selection');
              selectedItems.forEach((selectedItem) =>
                searchParams.append(
                  'selection',
                  selectedItem.experimentPk.toString()
                )
              );

              return searchParams;
            });
          } else {
            setSearchParams((searchParams) => {
              searchParams.delete('selection');

              return searchParams;
            });
          }
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

      {experimentPkToReview !== null && (
        <ExperimentReviewModal
          title={
            selectedExperiment
              ? `View Experiment: ${selectedExperiment.experimentId} - (${toFormattedDateTime(selectedExperiment.startsAt)} - ${toFormattedDateTime(selectedExperiment.endsAt)})`
              : 'View Experiment'
          }
          modalOpen={true}
          handleClose={() => {
            setSearchParams((searchParams) => {
              searchParams.delete('experiment');

              return searchParams;
            });
          }}
        >
          <ExperimentReviewContent
            experimentPk={experimentPkToReview}
            tabNames={experimentReviewTabs}
            isInsideModal={true}
          />
        </ExperimentReviewModal>
      )}
    </div>
  );
}
