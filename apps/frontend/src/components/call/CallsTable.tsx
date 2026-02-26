import { DropResult } from '@hello-pangea/dnd';
import { Column } from '@material-table/core';
import Archive from '@mui/icons-material/Archive';
import GridOnIcon from '@mui/icons-material/GridOn';
import Unarchive from '@mui/icons-material/Unarchive';
import { Paper } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import React, { useCallback, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import i18n from 'i18n';

import ScienceIcon from 'components/common/icons/ScienceIcon';
import StyledDialog from 'components/common/StyledDialog';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import {
  UpdateCallInput,
  AssignInstrumentsToCallMutation,
  InstrumentWithAvailabilityTime,
  UserRole,
  Call,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { CallsDataQuantity, useCallsData } from 'hooks/call/useCallsData';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useDownloadXLSXCallFap } from 'hooks/fap/useDownloadXLSXCallFap';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm from 'utils/withConfirm';

import AssignedInstrumentsTable from './AssignedInstrumentsTable';
import AssignInstrumentsToCall from './AssignInstrumentsToCall';
import CallReorder from './CallOrderEditor';
import CallStatusFilter, {
  CallStatus,
  CallStatusFilters,
} from './CallStatusFilter';
import CreateUpdateCall from './CreateUpdateCall';
const getFilterStatus = (
  callStatus: CallStatusFilters,
  archived: boolean
): Partial<
  Record<
    | 'isEnded'
    | 'isEndedInternal'
    | 'isCallEndedByEvent'
    | 'isActive'
    | 'isCallUpcoming',
    boolean
  >
> => {
  if (callStatus === CallStatus.ALL) {
    return {
      isActive: archived,
    }; // if set to ALL we don't filter by status
  }

  if (callStatus === CallStatus.CLOSED) {
    return {
      isEnded: callStatus === CallStatus.CLOSED,
      isActive: archived,
    };
  } else {
    return {
      isCallUpcoming: true,
      isActive: archived,
    };
  }
};
interface Options {
  title: string;
  description: ReactElement | string | null;
}

export type WithConfirmType = (
  callback: FunctionType,
  params: Options
) => FunctionType;
export interface CallTableProps {
  isArchivedTab: boolean;
  confirm: WithConfirmType;
}
const CallsTable = ({ confirm, isArchivedTab }: CallTableProps) => {
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();
  const { timezone, toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });
  const [assigningInstrumentsCallId, setAssigningInstrumentsCallId] = useState<
    number | null
  >(null);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const [searchParam, setSearchParam] = useSearchParams({
    callStatus: CallStatus.ALL,
  });

  const exportFapData = useDownloadXLSXCallFap();
  const search = searchParam.get('search');
  const [isCallReorderMode, setIsCallReorderMode] = useState(false);
  let callStatus = searchParam.get('callStatus');

  if (!isArchivedTab) {
    callStatus = CallStatus.ALL;
  }
  const {
    loadingCalls,
    calls,
    setCallsWithLoading: setCalls,
    setCallsFilter,
  } = useCallsData(
    {
      ...getFilterStatus(
        (callStatus as CallStatusFilters) ?? CallStatus.ALL,
        isArchivedTab
      ),
    },
    CallsDataQuantity.EXTENDED
  );

  const handleStatusFilterChange = (callStatus: CallStatus) => {
    setSearchParam((searchParam) => {
      searchParam.set('callStatus', callStatus);

      return searchParam;
    });

    setCallsFilter(() => ({
      ...getFilterStatus(callStatus as CallStatusFilters, isArchivedTab),
    }));
  };

  // NOTE: Here we keep the columns inside the component just because of the timezone shown in the title
  const columns: Column<Call>[] = [
    { title: 'Short Code', field: 'shortCode' },
    {
      title: `Start Date (${timezone})`,
      render: (rowdata) => toFormattedDateTime(rowdata.startCall),
      field: 'startCall',
      customSort: (a: Call, b: Call) =>
        new Date(a.startCall).getTime() - new Date(b.startCall).getTime(),
    },
    {
      title: `End Date (${timezone})`,
      render: (rowdata) => toFormattedDateTime(rowdata.endCall),
      field: 'endCall',
      customSort: (a: Call, b: Call) =>
        new Date(a.endCall).getTime() - new Date(b.endCall).getTime(),
    },
    {
      title: 'Reference number format',
      field: 'referenceNumberFormat',
      emptyValue: '-',
    },
    {
      title: 'Proposal Workflow',
      field: 'proposalWorkflow.name',
      emptyValue: '-',
    },
    {
      title: 'Experiment Workflow',
      field: 'experimentWorkflow.name',
      emptyValue: '-',
    },
    {
      title: 'Proposal template',
      field: 'template.name',
      emptyValue: '-',
    },
    {
      title: '#' + i18n.format(t('Instrument'), 'plural'),
      render: (data) => data.instruments.length,
    },
    {
      title: '#Proposals',
      field: 'proposalCount',
    },
    {
      title: '#' + i18n.format(t('FAP'), 'plural'),
      render: (data) => data.faps?.length,
    },
  ];

  const assignInstrumentsToCall = useCallback(
    (
      callId: number,
      instruments: AssignInstrumentsToCallMutation['assignInstrumentsToCall']['instruments']
    ) => {
      if (calls) {
        const callsWithInstruments = calls.map((callItem) => {
          if (callItem.id === callId) {
            return {
              ...callItem,
              instruments: instruments,
            };
          } else {
            return callItem;
          }
        });
        setCalls(callsWithInstruments as Call[]);
        setAssigningInstrumentsCallId(null);
      }
    },
    [calls, setCalls, setAssigningInstrumentsCallId]
  );

  const changeCallActiveStatus = (call: Call) => {
    const shouldActivateCall = !call.isActive;
    confirm(
      async () => {
        await api({
          toastSuccessMessage: `Call ${
            shouldActivateCall ? 'activated' : 'deactivated'
          } successfully`,
        }).updateCall({
          id: call.id,
          isActive: shouldActivateCall,
        } as UpdateCallInput);

        const newCallsArray = calls.filter(
          (objectItem) => objectItem.id !== call.id
        );
        setCalls(newCallsArray);
      },
      {
        title: `${shouldActivateCall ? 'Activate' : 'Deactivate'} call`,
        description: `Are you sure you want to ${
          shouldActivateCall ? 'activate' : 'deactivate'
        } this call?`,
      }
    )();
  };

  const deleteCall = async (id: number | string) => {
    try {
      await api({
        toastSuccessMessage: 'Call deleted successfully',
      }).deleteCall({
        id: id as number,
      });
      const newObjectsArray = calls.filter(
        (objectItem) => objectItem.id !== id
      );
      setCalls(newObjectsArray);

      return true;
    } catch {
      return false;
    }
  };

  const ScienceIconComponent = (): JSX.Element => <ScienceIcon />;

  const AssignedInstruments = React.useCallback(
    ({ rowData }: Record<'rowData', Call>) => {
      const removeAssignedInstrumentFromCall = (
        updatedInstruments: InstrumentWithAvailabilityTime[],
        callToRemoveFromId: number
      ) => {
        if (calls) {
          const callsWithRemovedInstrument = calls.map((callItem) => {
            if (callItem.id === callToRemoveFromId) {
              return {
                ...callItem,
                instruments: updatedInstruments,
              };
            } else {
              return callItem;
            }
          });

          setCalls(callsWithRemovedInstrument);
          setAssigningInstrumentsCallId(null);
        }
      };

      const setInstrumentAvailabilityTime = (
        updatedInstruments: InstrumentWithAvailabilityTime[],
        updatingCallId: number
      ) => {
        if (calls) {
          const callsWithInstrumentAvailabilityTime = calls.map((callItem) => {
            if (callItem.id === updatingCallId) {
              return {
                ...callItem,
                instruments: updatedInstruments,
              };
            } else {
              return callItem;
            }
          });

          setCalls(callsWithInstrumentAvailabilityTime);
        }
      };

      return (
        <AssignedInstrumentsTable
          call={rowData}
          assignInstrumentsToCall={(
            instruments: InstrumentWithAvailabilityTime[]
          ) => assignInstrumentsToCall(rowData.id, instruments)}
          removeAssignedInstrumentFromCall={removeAssignedInstrumentFromCall}
          setInstrumentAvailabilityTime={setInstrumentAvailabilityTime}
        />
      );
    },
    [calls, setCalls, assignInstrumentsToCall]
  );

  const callAssignments = calls.find(
    (callItem) => callItem.id === assigningInstrumentsCallId
  );

  const createModal = (
    onUpdate: FunctionType<void, [Call | null]>,
    onCreate: FunctionType<void, [Call | null]>,
    editCall: Call | null
  ) => (
    <CreateUpdateCall
      call={editCall}
      close={(call): void => {
        !!editCall ? onUpdate(call) : onCreate(call);
      }}
    />
  );
  const reorder = (
    list: Call[],
    startIndex: number,
    endIndex: number
  ): Call[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: DropResult): void => {
    if (!result.destination) return;
    const callsWithUpdatedOrder = reorder(
      calls,
      result.source.index,
      result.destination.index
    );
    setCalls(
      callsWithUpdatedOrder.sort((a, b) =>
        a.sort_order > b.sort_order ? -1 : 1
      )
    );
    const callOrderList = callsWithUpdatedOrder.map((item, index) => ({
      callId: item.id,
      sort_order: index,
    }));

    api().updateCallOrder({
      data: callOrderList,
    });
  };

  const getCallOrder = (): void => {
    setCallsFilter(() => ({
      ...getFilterStatus(callStatus as CallStatusFilters, isArchivedTab),
      isOrdered: true,
    }));
  };

  return (
    <div data-cy="calls-table">
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <CallStatusFilter
            show={isArchivedTab && !isCallReorderMode}
            callStatus={callStatus ?? CallStatus.ALL}
            onChange={handleStatusFilterChange}
          />
        </Grid>
      </Grid>
      {callStatus === CallStatus.OPENUPCOMING && (
        <FormGroup
          row
          style={{ justifyContent: 'flex-end', paddingBottom: '25px' }}
        >
          <FormControlLabel
            data-cy="order-calls-button"
            control={
              <Switch
                checked={isCallReorderMode}
                onChange={(): void => {
                  if (!isCallReorderMode) {
                    getCallOrder();
                  }
                  setIsCallReorderMode(!isCallReorderMode);
                }}
              />
            }
            label="Order calls mode"
          />
        </FormGroup>
      )}

      {isCallReorderMode && (
        <div>
          <Typography variant="h6" component="h2">
            Drag to order calls
          </Typography>
          <Paper>
            <CallReorder items={calls} onDragEnd={onDragEnd} />
          </Paper>
        </div>
      )}

      {assigningInstrumentsCallId && (
        <StyledDialog
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={!!assigningInstrumentsCallId}
          onClose={(): void => setAssigningInstrumentsCallId(null)}
          maxWidth="xl"
          fullWidth
          title={`Assign Instruments to the selected call - ${calls.find((callItem) => callItem.id === assigningInstrumentsCallId)?.shortCode}`}
        >
          <DialogContent>
            <AssignInstrumentsToCall
              assignedInstruments={callAssignments?.instruments}
              callId={assigningInstrumentsCallId}
              assignInstrumentsToCall={(instruments) =>
                assignInstrumentsToCall(assigningInstrumentsCallId, instruments)
              }
            />
          </DialogContent>
        </StyledDialog>
      )}
      {!isCallReorderMode && (
        <SuperMaterialTable
          createModal={createModal}
          setData={setCalls}
          delete={deleteCall}
          hasAccess={{
            create: isUserOfficer && isArchivedTab,
            update: isUserOfficer,
            remove: isUserOfficer,
          }}
          icons={tableIcons}
          title={
            <Typography variant="h6" component="h2">
              Calls
            </Typography>
          }
          columns={columns}
          data={calls}
          isLoading={loadingCalls}
          detailPanel={[
            {
              tooltip: 'Show ' + i18n.format(t('instrument'), 'plural'),
              render: AssignedInstruments,
            },
          ]}
          options={{
            search: true,
            searchText: search || undefined,
          }}
          actions={[
            {
              icon: ScienceIconComponent,
              tooltip: 'Assign ' + t('instrument'),
              onClick: (event, rowData): void =>
                setAssigningInstrumentsCallId((rowData as Call).id),
              position: 'row',
            },
            (rowData) => ({
              icon: rowData.isActive ? Archive : Unarchive,
              tooltip: `${rowData.isActive ? 'Archive' : 'Unarchive'} call`,
              onClick: (): void => changeCallActiveStatus(rowData as Call),
              position: 'row',
            }),
            (rowData) => ({
              icon: GridOnIcon,
              tooltip: `Export ${t('Fap')} Data`,
              onClick: (): void => exportFapData(rowData.id, rowData.shortCode),
              position: 'row',
            }),
          ]}
          persistUrlQueryParams={true}
        />
      )}
    </div>
  );
};

export default withConfirm(CallsTable);
