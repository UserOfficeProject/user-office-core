import dateformat from 'dateformat';
import React, { useState } from 'react';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import ScienceIconAdd from 'components/common/icons/ScienceIconAdd';
import InputDialog from 'components/common/InputDialog';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { Call, InstrumentWithAvailabilityTime, UserRole } from 'generated/sdk';
import { useCallsData } from 'hooks/call/useCallsData';
import { tableIcons } from 'utils/materialIcons';

import AssignedInstrumentsTable from './AssignedInstrumentsTable';
import AssignInstrumentsToCall from './AssignInstrumentsToCall';
import CreateUpdateCall from './CreateUpdateCall';

const CallsTable: React.FC = () => {
  const { loadingCalls, calls, setCallsWithLoading: setCalls } = useCallsData();
  const [assigningInstrumentsCallId, setAssigningInstrumentsCallId] = useState<
    number | null
  >(null);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType
  >(DefaultQueryParams);

  const columns = [
    { title: 'Short Code', field: 'shortCode' },
    {
      title: 'Start Date',
      field: 'startCall',
      render: (rowData: Call): string =>
        dateformat(new Date(rowData.startCall), 'dd-mmm-yyyy'),
    },
    {
      title: 'End Date',
      field: 'endCall',
      render: (rowData: Call): string =>
        dateformat(new Date(rowData.endCall), 'dd-mmm-yyyy'),
    },
    {
      title: 'Instruments',
      render: (rowData: Call): string =>
        rowData.instruments && rowData.instruments.length > 0
          ? rowData.instruments.length.toString()
          : '-',
    },
    {
      title: 'Proposal Workflow',
      render: (rowData: Call): string =>
        rowData.proposalWorkflow && rowData.proposalWorkflow.name
          ? rowData.proposalWorkflow.name
          : '-',
    },
    {
      title: '#proposals',
      field: 'proposalCount',
    },
  ];

  const assignInstrumentsToCall = (
    instruments: InstrumentWithAvailabilityTime[]
  ) => {
    if (calls) {
      const callsWithInstruments = calls.map(callItem => {
        if (callItem.id === assigningInstrumentsCallId) {
          return {
            ...callItem,
            instruments: [...callItem.instruments, ...instruments],
          };
        } else {
          return callItem;
        }
      });

      setCalls(callsWithInstruments);
      setAssigningInstrumentsCallId(null);
    }
  };

  const removeAssignedInstrumentFromCall = (
    updatedInstruments: InstrumentWithAvailabilityTime[],
    callToRemoveFromId: number
  ) => {
    if (calls) {
      const callsWithRemovedInstrument = calls.map(callItem => {
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
      const callsWithInstrumentAvailabilityTime = calls.map(callItem => {
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
  const ScienceIconComponent = (): JSX.Element => <ScienceIconAdd />;

  const AssignedInstruments = (rowData: Call) => (
    <AssignedInstrumentsTable
      call={rowData}
      removeAssignedInstrumentFromCall={removeAssignedInstrumentFromCall}
      setInstrumentAvailabilityTime={setInstrumentAvailabilityTime}
    />
  );

  const callAssignments = calls.find(
    callItem => callItem.id === assigningInstrumentsCallId
  );

  const createModal = (
    onUpdate: Function,
    onCreate: Function,
    editCall: Call | null
  ) => (
    <CreateUpdateCall
      call={editCall}
      close={(call): void => {
        !!editCall ? onUpdate(call) : onCreate(call);
      }}
    />
  );

  return (
    <div data-cy="calls-table">
      {assigningInstrumentsCallId && (
        <InputDialog
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={!!assigningInstrumentsCallId}
          onClose={(): void => setAssigningInstrumentsCallId(null)}
        >
          <AssignInstrumentsToCall
            assignedInstruments={
              callAssignments?.instruments as InstrumentWithAvailabilityTime[]
            }
            callId={assigningInstrumentsCallId}
            assignInstrumentsToCall={(
              instruments: InstrumentWithAvailabilityTime[]
            ) => assignInstrumentsToCall(instruments)}
          />
        </InputDialog>
      )}
      <SuperMaterialTable
        createModal={createModal}
        setData={setCalls}
        hasAccess={{
          create: isUserOfficer,
          update: isUserOfficer,
          remove: isUserOfficer,
        }}
        icons={tableIcons}
        title="Calls"
        columns={columns}
        data={calls}
        isLoading={loadingCalls}
        detailPanel={[
          {
            tooltip: 'Show Instruments',
            render: AssignedInstruments,
          },
        ]}
        options={{
          search: false,
        }}
        actions={[
          {
            icon: ScienceIconComponent,
            tooltip: 'Assign Instrument',
            onClick: (event, rowData): void =>
              setAssigningInstrumentsCallId((rowData as Call).id),
            position: 'row',
          },
        ]}
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
      />
    </div>
  );
};

export default CallsTable;
