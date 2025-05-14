import MaterialTableCore, {
  Column,
  OrderByCollection,
  Query,
  QueryResult,
} from '@material-table/core';
import { Replay, Refresh } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Link as ReactRouterLink, useSearchParams } from 'react-router-dom';

import MaterialTable from 'components/common/DenseMaterialTable';
import CallFilter from 'components/common/proposalFilters/CallFilter';
import {
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
  const tableRef = React.useRef<MaterialTableCore<StatusActionsLog>>();
  const { api } = useDataApiWithFeedback();
  const theme = useTheme();
  const { calls, loadingCalls } = useCallsData();
  const ReplayIcon = (): JSX.Element => (
    <Replay data-cy="replay_status_action_icon" />
  );
  const RefreshIcon = (): JSX.Element => <Refresh />;
  const [selectedStatusActionsLog, setStatusActionsLog] =
    useState<StatusActionsLog | null>(null);
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
    columns = setSortDirectionOnSortField(columns, sortField, sortDirection);
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
    new Promise<QueryResult<StatusActionsLog>>(async (resolve, reject) => {
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
        const results = await api().getStatusActionsLogs({
          filter,
          searchText: tableQuery.search,
          sortField: orderBy?.orderByField,
          sortDirection: orderBy?.orderDirection,
          first: tableQuery.pageSize,
          offset: tableQuery.page * tableQuery.pageSize,
        });
        const data: StatusActionsLog[] =
          results.statusActionsLogs?.statusActionsLogs.map(
            (statusActionsLog) => {
              return {
                ...statusActionsLog,
                statusActionsTstamp: toFormattedDateTime(
                  statusActionsLog.statusActionsTstamp
                ),
              } as StatusActionsLog;
            }
          ) || [];
        resolve({
          data: data,
          page: tableQuery.page,
          totalCount: results.statusActionsLogs?.totalCount || 0,
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
                switch (statusActionType) {
                  case StatusActionType.EMAIL:
                    return 'Email Status Actions Logs';
                  case StatusActionType.PROPOSALDOWNLOAD:
                    return 'Proposal Download Status Actions Logs';
                  default:
                    return 'Status Actions Logs';
                }
              })()}
            </Typography>
          }
          onRowClick={() => {
            setStatusActionsLog(null);
          }}
          columns={columns}
          data={fetchStatusActionsLogsData}
          options={{
            search: true,
            selection: false,
            searchText: search || undefined,
            debounceInterval: 600,
            columnsButton: true,
            pageSize: pageSize ? +pageSize : 20,
            initialPage: page ? +page : 0,
            idSynonym: 'statusActionsLogId',
            rowStyle: (rowdata: StatusActionsLog): React.CSSProperties => {
              const style = rowdata.statusActionsSuccessful
                ? { color: theme.palette.success.main }
                : { color: theme.palette.error.main };

              if (
                selectedStatusActionsLog &&
                rowdata.statusActionsLogId ===
                  selectedStatusActionsLog.statusActionsLogId
              ) {
                return {
                  ...style,
                  backgroundColor: theme.palette.grey[100],
                };
              }

              return style;
            },
          }}
          actions={[
            {
              icon: ReplayIcon,
              tooltip: 'Replay status action',
              onClick: (_event: unknown, rowData: unknown): void => {
                const statusActionsLog = rowData as StatusActionsLog;
                if (statusActionsLog.statusActionsLogId) {
                  confirm(
                    () =>
                      api({
                        toastSuccessMessage:
                          'Status action replay successfully send',
                      })
                        .replayStatusActionsLog({
                          statusActionsLogId:
                            statusActionsLog.statusActionsLogId,
                        })
                        .then((result) => {
                          if (result.replayStatusActionsLog) {
                            setStatusActionsLog(statusActionsLog);
                          }
                        }),
                    {
                      title: 'Are you sure?',
                      description: `You are about to send a status action replay request.`,
                      alertText: (() => {
                        if (statusActionsLog.statusActionsSuccessful) {
                          switch (statusActionType) {
                            case StatusActionType.EMAIL:
                              return 'This email status action was already successful. Replaying it will lead to duplicate emails being sent.';
                            default:
                              return 'This status action was already successful. Replaying it may lead to unexpected behavior or redundant processes.';
                          }
                        }
                      })(),
                      confirmationText: 'Replay',
                      shouldEnableOKWithAlert: true,
                    }
                  )();
                }
              },
            },
            {
              icon: RefreshIcon,
              tooltip: 'Refresh status actions log data',
              isFreeAction: true,
              onClick: () =>
                tableRef.current && tableRef.current.onQueryChange({}),
            },
          ]}
          onChangeColumnHidden={(columnChange) => {
            const proposalColumns = columns.map(
              (statusActionLogsColumn: Column<StatusActionsLog>) => ({
                hidden:
                  statusActionLogsColumn.title === columnChange.title
                    ? columnChange.hidden
                    : statusActionLogsColumn.hidden,
                title: statusActionLogsColumn.title,
              })
            );

            setLocalStorageValue(proposalColumns);
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
