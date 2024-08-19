import MaterialTableCore, {
  Column,
  OrderByCollection,
  Query,
  QueryResult,
} from '@material-table/core';
import { Replay, Refresh } from '@mui/icons-material';
import { Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { NumberParam, QueryParamConfig, StringParam } from 'use-query-params';
import useQueryParams from 'use-query-params/dist/useQueryParams';

import MaterialTable from 'components/common/DenseMaterialTable';
import { StatusActionsLog } from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useLocalStorage } from 'hooks/common/useLocalStorage';
import { setSortDirectionOnSortField } from 'utils/helperFunctions';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

export type StatusActionsLogsQueryParams = {
  sortDirection: QueryParamConfig<string | null | undefined>;
  search: QueryParamConfig<string | null | undefined>;
  sortField: QueryParamConfig<string | null | undefined>;
  page: QueryParamConfig<number | null | undefined>;
  pageSize: QueryParamConfig<number | null | undefined>;
};

const StatusActionsLogsTable = ({ confirm }: { confirm: WithConfirmType }) => {
  const { toFormattedDateTime } = useFormattedDateTime();
  const tableRef = React.useRef<MaterialTableCore<StatusActionsLog>>();
  const { api } = useDataApiWithFeedback();
  const theme = useTheme();

  const ReplayIcon = (): JSX.Element => (
    <Replay data-cy="replay_status_action_icon" />
  );
  const RefreshIcon = (): JSX.Element => <Refresh />;
  const [selectedStatusActionsLog, setStatusActionsLog] =
    useState<StatusActionsLog | null>(null);
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<StatusActionsLogsQueryParams>({
      sortDirection: StringParam,
      search: StringParam,
      sortField: StringParam,
      page: NumberParam,
      pageSize: NumberParam,
    });
  let columns: Column<StatusActionsLog>[] = [
    {
      title: 'Status Action',
      field: 'statusActionsStep',
      render: (rowData: StatusActionsLog): string =>
        rowData.connectionStatusAction?.action.type
          ? `${rowData.connectionStatusAction?.action.type} ${rowData.statusActionsStep}  `
          : 'Not set',
      cellStyle: { minWidth: 300 },
    },
    {
      title: 'Proposal IDs',
      field: 'proposalIds',
      sorting: false,
      render: (rowData: StatusActionsLog) => {
        return rowData.proposals.map((proposal) => (
          <ReactRouterLink
            key={proposal.primaryKey}
            to={`/Proposals?reviewModal=${proposal.primaryKey}`}
            onClick={() => setUrlQueryParams({})}
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
    },
  ];
  const [localStorageValue, setLocalStorageValue] = useLocalStorage<
    Column<StatusActionsLog>[] | null
  >('statusActionLogsColumnsOfficer', null);
  columns = columns.map((v: Column<StatusActionsLog>) => {
    v.customSort = () => 0; // Disables client side sorting

    return v;
  });
  if (urlQueryParams.sortField && urlQueryParams.sortDirection) {
    columns = setSortDirectionOnSortField(
      columns,
      urlQueryParams.sortField,
      urlQueryParams.sortDirection
    );
  }
  if (localStorageValue) {
    columns = columns.map((column) => ({
      ...column,
      hidden: localStorageValue?.find(
        (localStorageValueItem) => localStorageValueItem.title === column.title
      )?.hidden,
    }));
  }
  const fetchStatusActionsLogsData = (tableQuery: Query<StatusActionsLog>) =>
    new Promise<QueryResult<StatusActionsLog>>(async (resolve, reject) => {
      try {
        const [orderBy] = tableQuery.orderByCollection;
        const results = await api().getStatusActionsLogs({
          filter: {},
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
      }
    });

  return (
    <>
      <MaterialTable
        tableRef={tableRef}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            Status Actions Logs
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
          searchText: urlQueryParams.search || undefined,
          debounceInterval: 600,
          columnsButton: true,
          pageSize: urlQueryParams.pageSize || 20,
          initialPage: urlQueryParams.page || 0,
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
                        statusActionsLogId: statusActionsLog.statusActionsLogId,
                      })
                      .then((result) => {
                        if (result.replayStatusActionsLog) {
                          setStatusActionsLog(statusActionsLog);
                        }
                      }),
                  {
                    title: 'Are you sure?',
                    description: `You are about to send a status action replay request`,
                    alertText: statusActionsLog.statusActionsSuccessful
                      ? 'This status action is already successful resending a request will lead to duplicate notifications being send'
                      : '',
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
          setUrlQueryParams({
            page: +page.toString(),
            pageSize: +pageSize.toString(),
          });
        }}
        onSearchChange={(searchText) => {
          setUrlQueryParams({
            search: searchText ? searchText : '',
            page: searchText ? 0 : urlQueryParams.pageSize || 0,
          });
        }}
        onOrderCollectionChange={(orderByCollection: OrderByCollection[]) => {
          const [orderBy] = orderByCollection;
          setUrlQueryParams((params) => ({
            ...params,
            sortField: orderBy?.orderByField,
            sortDirection: orderBy?.orderDirection,
          }));
        }}
      />
    </>
  );
};
export default withConfirm(StatusActionsLogsTable);
