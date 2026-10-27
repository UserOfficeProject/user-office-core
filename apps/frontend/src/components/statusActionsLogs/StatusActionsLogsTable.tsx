import MaterialTableCore, {
  Action,
  Column,
  OrderByCollection,
  Query,
  QueryResult,
} from '@material-table/core';
import { Refresh } from '@mui/icons-material';
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import { Badge, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link as ReactRouterLink, useSearchParams } from 'react-router-dom';

import MaterialTable from 'components/common/DenseMaterialTable';
import CallFilter from 'components/common/proposalFilters/CallFilter';
import {
  PaginationSortDirection,
  StatusActionsLog,
  StatusActionsLogsFilter,
  StatusActionType,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { setSortDirectionOnSortField } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import StatusActionsStatusFilter, {
  StatusActionsLogStatus,
} from './StatusActionsStatusFilter';

interface StatusActionsLogsTableProps {
  confirm: WithConfirmType;
  statusActionType: StatusActionType;
}

const StatusActionsLogsTable = ({
  confirm,
  statusActionType: propStatusActionType,
}: StatusActionsLogsTableProps) => {
  const [statusActionType] = useState<StatusActionType>(propStatusActionType);
  const { toFormattedDateTime } = useFormattedDateTime();
  const tableRef = React.useRef<MaterialTableCore<StatusActionsLog>>(undefined);
  const { api } = useDataApiWithFeedback();
  const theme = useTheme();
  const { calls, loadingCalls } = useCallsData();
  const [selectedCallName, setSelectedCallName] = useState<string | undefined>(
    undefined
  );
  const ReplayAllIcon = () => (
    <ReplayCircleFilledIcon data-cy="replay_all_status_action_icon" />
  );
  const RefreshIcon = () => <Refresh />;
  const [currentPageLogIds, setCurrentPageLogIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams({
    statusActionsLogStatus: StatusActionsLogStatus.ALL,
  });
  const sortField = searchParams.get('sortField');
  const sortDirection = searchParams.get('sortDirection');
  const statusActionsLogStatus = searchParams.get('statusActionsLogStatus');
  const call = searchParams.get('call');
  const search = searchParams.get('search');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const selectedStatusActionsLogIds = searchParams.getAll('selection');
  let columns: Column<StatusActionsLog>[] = [
    ...(statusActionType === StatusActionType.EMAIL
      ? [
          {
            title: 'Email Status Action Recipient',
            field: 'emailStatusActionRecipient',
          },
        ]
      : []),
    {
      title: 'Proposal IDs',
      field: 'proposalIds',
      sorting: false,
      render: (rowData: StatusActionsLog) => {
        return rowData.proposals.map((proposal) => (
          <ReactRouterLink
            key={proposal.primaryKey}
            to={`/?proposalId=${proposal.proposalId}`}
            onClick={() => setSearchParams({})}
          >
            {proposal.proposalId}
          </ReactRouterLink>
        ));
      },
    },
    {
      title: 'Status',
      field: 'statusActionsSuccessful',
      lookup: { true: 'SUCCESSFUL', false: 'FAIL' },
    },
    {
      title: 'Message',
      field: 'statusActionsMessage',
    },
    {
      title: 'Log Time',
      field: 'statusActionsTstamp',
      defaultSort: 'desc',
    },
  ];
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<StatusActionsLog>[] | null
  >('statusActionLogsColumnsOfficer', null);
  columns = columns.map((v: Column<StatusActionsLog>) => {
    v.customSort = () => 0; // Disables client side sorting

    return v;
  });
  if (sortField && sortDirection) {
    columns = setSortDirectionOnSortField(
      columns,
      sortField,
      sortDirection == PaginationSortDirection.ASC
        ? PaginationSortDirection.ASC
        : sortDirection == PaginationSortDirection.DESC
          ? PaginationSortDirection.DESC
          : undefined
    );
  }
  if (localStorageValue) {
    columns = columns.map((column) => ({
      ...column,
      hidden: localStorageValue.find(
        (localStorageValueItem) => localStorageValueItem.title === column.title
      )?.hidden,
    }));
  }
  const handleStatusActionsLogStatusFilterChange = (
    statusActionsLogStatus: StatusActionsLogStatus
  ) => {
    setSearchParams((searchParams) => {
      searchParams.set('statusActionsLogStatus', statusActionsLogStatus);

      return searchParams;
    });
    tableRef.current && tableRef.current.onQueryChange({});
  };
  const handleSortOrderChange = (orderByCollection: OrderByCollection[]) => {
    const [orderBy] = orderByCollection;
    setSearchParams((searchParam) => {
      searchParam.delete('sortField');
      searchParam.delete('sortDirection');
      if (orderBy?.orderByField != null && orderBy?.orderDirection != null) {
        searchParam.set('sortField', orderBy?.orderByField);
        searchParam.set('sortDirection', orderBy?.orderDirection);
      }

      return searchParam;
    });
  };
  const fetchStatusActionsLogsData = (tableQuery: Query<StatusActionsLog>) =>
    new Promise<QueryResult<StatusActionsLog>>((resolve, reject) => {
      try {
        const [orderBy] = tableQuery.orderByCollection;
        let filter: StatusActionsLogsFilter = {
          statusActionType: statusActionType,
        };

        if (
          statusActionsLogStatus &&
          statusActionsLogStatus !== StatusActionsLogStatus.ALL
        ) {
          filter = {
            ...filter,
            statusActionsSuccessful:
              statusActionsLogStatus === 'true' ? true : false,
          };
        }
        if (!!call) {
          filter = {
            ...filter,
            callIds: [+call],
          };
        }
        api()
          .getStatusActionsLogs({
            filter,
            searchText: tableQuery.search,
            sortField: orderBy?.orderByField,
            sortDirection:
              orderBy?.orderDirection == PaginationSortDirection.ASC
                ? PaginationSortDirection.ASC
                : orderBy?.orderDirection == PaginationSortDirection.DESC
                  ? PaginationSortDirection.DESC
                  : undefined,
            first: tableQuery.pageSize,
            offset: tableQuery.page * tableQuery.pageSize,
          })
          .then((results) => {
            const selection = new Set(searchParams.getAll('selection'));
            const data: StatusActionsLog[] =
              results.statusActionsLogs?.statusActionsLogs.map(
                (statusActionsLog) => {
                  return {
                    ...statusActionsLog,
                    statusActionsTstamp: toFormattedDateTime(
                      statusActionsLog.statusActionsTstamp
                    ),
                    tableData: {
                      checked: selection.has(
                        statusActionsLog.statusActionsLogId.toString()
                      ),
                    },
                  } as unknown as StatusActionsLog;
                }
              ) || [];
            setCurrentPageLogIds(
              data.map((statusActionsLog) =>
                statusActionsLog.statusActionsLogId.toString()
              )
            );
            resolve({
              data: data,
              page: tableQuery.page,
              totalCount: results.statusActionsLogs?.totalCount || 0,
            });
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      } finally {
        if (
          statusActionsLogStatus &&
          statusActionsLogStatus === StatusActionsLogStatus.ALL
        ) {
          setSearchParams((searchParams) => {
            searchParams.delete('statusActionsLogStatus');

            return searchParams;
          });
        }
      }
    });

  useEffect(() => {
    if (call) {
      const callFromParam = calls.find((c) => c.id === +call);
      setSelectedCallName(callFromParam?.shortCode);
    } else {
      setSelectedCallName(undefined);
    }
  }, [call, setSelectedCallName, calls]);

  const getAllFailedLogsForCall = async (
    callId: number
  ): Promise<StatusActionsLog[]> => {
    const filter: StatusActionsLogsFilter = {
      statusActionType: statusActionType,
      callIds: [callId],
      statusActionsSuccessful: false,
    };

    const result = await api().getStatusActionsLogs({
      filter,
    });

    return (
      result.statusActionsLogs?.statusActionsLogs.map((statusActionsLog) => {
        return {
          ...statusActionsLog,
          statusActionsTstamp: toFormattedDateTime(
            statusActionsLog.statusActionsTstamp
          ),
        } as StatusActionsLog;
      }) || []
    );
  };

  const handleBulkReplayStatusActionsLogs = (): void => {
    if (!selectedStatusActionsLogIds.length) {
      return;
    }

    confirm(
      () =>
        api({
          toastSuccessMessage: 'Status action replay successfully sent.',
        })
          .replayStatusActionsLogs({
            statusActionsLogIds: Array.from(
              new Set(selectedStatusActionsLogIds)
            ).map((logId) => +logId),
          })
          .then(() => {
            setSearchParams((searchParams) => {
              searchParams.delete('selection');

              return searchParams;
            });
            tableRef.current && tableRef.current.onQueryChange({});
          }),
      {
        title: 'Are you sure?',
        description: `You are about to send a status action replay request for ${selectedStatusActionsLogIds.length} selected status action log(s).`,
        alertText:
          'Any selected status action log(s) that can no longer be replayed will be skipped.',
        confirmationText: 'Replay',
        shouldEnableOKWithAlert: true,
      }
    )();
  };

  const bulkReplayAction = {
    icon: () => (
      <Badge
        data-cy="replay_selected_status_actions_count"
        badgeContent={selectedStatusActionsLogIds.length}
        color="primary"
      >
        <ReplayAllIcon />
      </Badge>
    ),
    tooltip: `Replay ${selectedStatusActionsLogIds.length} selected status action(s)`,
    onClick: handleBulkReplayStatusActionsLogs,
    hidden: selectedStatusActionsLogIds.length === 0,
  };

  // material-table only ever renders 'toolbar' actions OR 'toolbarOnSelect'
  // actions, switching based on whether the current page has rows checked,
  // so this action is registered under both positions to stay visible
  // regardless of whether anything is checked on the currently viewed page.
  const tableActions: Action<StatusActionsLog>[] = [
    { ...bulkReplayAction, isFreeAction: true, position: 'toolbar' },
    { ...bulkReplayAction, position: 'toolbarOnSelect' },
  ];

  return (
    <>
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <CallFilter
            callId={call ? +call : null}
            calls={calls}
            isLoading={loadingCalls}
            shouldShowAll={true}
            onChange={() => {
              tableRef.current && tableRef.current.onQueryChange({});
            }}
          />
        </Grid>
        <Grid item sm={3} xs={12}>
          <StatusActionsStatusFilter
            statusActionsLogStatus={
              statusActionsLogStatus
                ? statusActionsLogStatus
                : StatusActionsLogStatus.ALL
            }
            onChange={handleStatusActionsLogStatusFilterChange}
          />
        </Grid>
      </Grid>
      <div data-cy="status-actions-logs-table">
        <MaterialTable
          tableRef={tableRef}
          icons={tableIcons}
          title={
            <Typography variant="h6" component="h2">
              {(() => {
                if (statusActionType === StatusActionType.PROPOSALDOWNLOAD) {
                  return 'Proposal Download Status Actions Logs';
                } else if (statusActionType === StatusActionType.EMAIL) {
                  return 'Email Status Actions Logs';
                } else {
                  return 'Status Action Logs';
                }
              })()}
            </Typography>
          }
          columns={columns}
          data={fetchStatusActionsLogsData}
          options={{
            search: true,
            selection: true,
            searchText: search || undefined,
            debounceInterval: 600,
            columnsButton: true,
            pageSize: pageSize ? +pageSize : 20,
            initialPage: page ? +page : 0,
            idSynonym: 'statusActionsLogId',
            rowStyle: (rowdata: StatusActionsLog): React.CSSProperties =>
              rowdata.statusActionsSuccessful
                ? { color: theme.palette.success.main }
                : { color: theme.palette.error.main },
            selectionProps: (rowData: StatusActionsLog) => ({
              disabled: !rowData.connectionStatusAction,
              title: rowData.connectionStatusAction
                ? undefined
                : 'This status action can no longer be replayed',
              sx: rowData.connectionStatusAction
                ? undefined
                : { pointerEvents: 'auto !important' },
            }),
          }}
          actions={[
            ...tableActions,
            {
              icon: RefreshIcon,
              tooltip: 'Refresh status actions log data',
              isFreeAction: true,
              onClick: () =>
                tableRef.current && tableRef.current.onQueryChange({}),
            },
            {
              icon: ReplayAllIcon,
              tooltip: 'Replay all failed status actions in call',
              isFreeAction: true,
              hidden: !call,
              onClick: () => {
                if (!call) {
                  return;
                }

                confirm(
                  async () => {
                    const failedLogs = await getAllFailedLogsForCall(+call);

                    return await api({
                      toastSuccessMessage:
                        'Replay request sent for all failed logs in the call.',
                    }).replayStatusActionsLogs({
                      statusActionsLogIds: failedLogs.map(
                        (log) => log.statusActionsLogId
                      ),
                    });
                  },
                  {
                    title: 'Retry all failed status actions in call',
                    description: `You are about to retry all failed status actions in call '${selectedCallName}'. 
                    This process will run in the background and may take some time to complete. 
                    Sort by the latest log time and use the refresh button in the table to see progress.`,
                    alertText:
                      'Ensure this operation is safe to perform - it cannot be cancelled.',
                    confirmationText: 'Retry All Failed',
                    shouldEnableOKWithAlert: true,
                  }
                )();
              },
            },
          ]}
          localization={{
            toolbar: {
              nRowsSelected: () =>
                `${selectedStatusActionsLogIds.length} row(s) selected`,
            },
          }}
          onSelectionChange={(selectedItems: StatusActionsLog[]) => {
            setSearchParams((searchParams) => {
              const otherPagesSelection = searchParams
                .getAll('selection')
                .filter((logId) => !currentPageLogIds.includes(logId));
              const currentPageSelection = selectedItems.map((selectedItem) =>
                selectedItem.statusActionsLogId.toString()
              );

              searchParams.delete('selection');
              Array.from(
                new Set([...otherPagesSelection, ...currentPageSelection])
              ).forEach((logId) => searchParams.append('selection', logId));

              return searchParams;
            });
          }}
          onChangeColumnHidden={(columnChange) => {
            const statusActionLogColumns = columns.map(
              (statusActionLogsColumn: Column<StatusActionsLog>) => ({
                hidden:
                  statusActionLogsColumn.title === columnChange.title
                    ? columnChange.hidden
                    : statusActionLogsColumn.hidden,
                title: statusActionLogsColumn.title,
              })
            );

            setLocalStorageValue(statusActionLogColumns);
          }}
          onPageChange={(page, pageSize) => {
            setSearchParams((searchParams) => {
              searchParams.set('page', page.toString());
              searchParams.set('pageSize', pageSize.toString());

              return searchParams;
            });
          }}
          onSearchChange={(searchText) => {
            setSearchParams({
              search: searchText ? searchText : '',
              page: searchText ? '0' : page || '',
            });
            if (!searchText) {
              setSearchParams((searchParams) => {
                searchParams.delete('searchText');

                return searchParams;
              });
            } else {
              setSearchParams((searchParams) => {
                searchParams.set('searchText', searchText);

                return searchParams;
              });
            }
          }}
          onOrderCollectionChange={handleSortOrderChange}
        />
      </div>
    </>
  );
};
export default withConfirm(StatusActionsLogsTable);
