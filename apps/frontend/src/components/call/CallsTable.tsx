import Archive from '@mui/icons-material/Archive';
import Unarchive from '@mui/icons-material/Unarchive';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import i18n from 'i18n';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import ScienceIcon from 'components/common/icons/ScienceIcon';
import InputDialog from 'components/common/InputDialog';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import {
  Call,
  InstrumentWithAvailabilityTime,
  UserRole,
  UpdateCallInput,
} from 'generated/sdk';
import { useFormattedDateTime } from 'hooks/admin/useFormattedDateTime';
import { useCallsData } from 'hooks/call/useCallsData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

import AssignedInstrumentsTable from './AssignedInstrumentsTable';
import AssignInstrumentsToCall from './AssignInstrumentsToCall';
import CallStatusFilter, {
  CallStatusQueryFilter,
  defaultCallStatusQueryFilter,
  CallStatus,
  CallStatusFilters,
} from './CallStatusFilter';
import CreateUpdateCall from './CreateUpdateCall';

const getFilterStatus = (
  callStatus: CallStatusFilters
): Partial<Record<'isActive' | 'isActiveInternal', boolean>> => {
  if (callStatus === CallStatus.ALL) {
    return {}; // if set to ALL we don't filter by status
  }

  if (callStatus === CallStatus.ACTIVE || callStatus === CallStatus.INACTIVE) {
    return {
      isActive: callStatus === CallStatus.ACTIVE,
    };
  } else {
    return { isActiveInternal: callStatus === CallStatus.ACTIVEINTERNAL };
  }
};

const CallsTable = ({ confirm }: WithConfirmProps) => {
  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();
  const { timezone, toFormattedDateTime } = useFormattedDateTime({
    shouldUseTimeZone: true,
  });
  const [assigningInstrumentsCallId, setAssigningInstrumentsCallId] = useState<
    number | null
  >(null);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType & CallStatusQueryFilter
  >({
    ...DefaultQueryParams,
    callStatus: defaultCallStatusQueryFilter,
  });

  const {
    loadingCalls,
    calls,
    setCallsWithLoading: setCalls,
    setCallsFilter,
  } = useCallsData({
    ...getFilterStatus(urlQueryParams.callStatus as CallStatusFilters),
  });

  const handleStatusFilterChange = (callStatus: CallStatus) => {
    setUrlQueryParams((queries) => ({ ...queries, callStatus }));
    setCallsFilter(() => ({
      ...getFilterStatus(callStatus as CallStatusFilters),
    }));
  };

  // NOTE: Here we keep the columns inside the component just because of the timezone shown in the title
  const columns = [
    { title: 'Short Code', field: 'shortCode' },
    {
      title: `Start Date (${timezone})`,
      field: 'formattedStartCall',
    },
    {
      title: `End Date (${timezone})`,
      field: 'formattedEndCall',
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
      title: 'Call template',
      field: 'template.name',
      emptyValue: '-',
    },
    {
      title: '#' + i18n.format(t('instrument'), 'plural'),
      field: 'instruments.length',
      emptyValue: '-',
    },
    {
      title: '#proposals',
      field: 'proposalCount',
    },
    {
      title: '#' + i18n.format(i18n.format(t('SEP'), 'plural'), 'lowercase'),
      field: 'seps.length',
      emptyValue: '-',
    },
  ];

  const assignInstrumentsToCall = useCallback(
    (callId: number, instruments: InstrumentWithAvailabilityTime[]) => {
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
        setCalls(callsWithInstruments);
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
          ...call,
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
    } catch (error) {
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

  const callsWithFormattedData = calls.map((call) => ({
    ...call,
    formattedStartCall: toFormattedDateTime(call.startCall),
    formattedEndCall: toFormattedDateTime(call.endCall),
  }));

  return (
    <div data-cy="calls-table">
      <Grid container spacing={2}>
        <Grid item sm={3} xs={12}>
          <CallStatusFilter
            callStatus={urlQueryParams.callStatus}
            onChange={handleStatusFilterChange}
          />
        </Grid>
      </Grid>
      {assigningInstrumentsCallId && (
        <InputDialog
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={!!assigningInstrumentsCallId}
          onClose={(): void => setAssigningInstrumentsCallId(null)}
          maxWidth="xl"
          fullWidth
        >
          <AssignInstrumentsToCall
            assignedInstruments={
              callAssignments?.instruments as InstrumentWithAvailabilityTime[]
            }
            callId={assigningInstrumentsCallId}
            assignInstrumentsToCall={(
              instruments: InstrumentWithAvailabilityTime[]
            ) =>
              assignInstrumentsToCall(assigningInstrumentsCallId, instruments)
            }
          />
        </InputDialog>
      )}
      <SuperMaterialTable
        createModal={createModal}
        setData={setCalls}
        delete={deleteCall}
        hasAccess={{
          create:
            isUserOfficer && urlQueryParams.callStatus !== CallStatus.INACTIVE,
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
        data={callsWithFormattedData}
        isLoading={loadingCalls}
        detailPanel={[
          {
            tooltip: 'Show ' + i18n.format(t('instrument'), 'plural'),
            render: AssignedInstruments,
          },
        ]}
        options={{
          search: false,
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
            tooltip: `${rowData.isActive ? 'Deactivate' : 'Activate'} call`,
            onClick: (): void => changeCallActiveStatus(rowData as Call),
            position: 'row',
          }),
        ]}
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
      />
    </div>
  );
};

export default withConfirm(CallsTable);
