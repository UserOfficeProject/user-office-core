import { Dialog, DialogContent, Button } from '@material-ui/core';
import { Add, Edit } from '@material-ui/icons';
import dateformat from 'dateformat';
import MaterialTable from 'material-table';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Call, Instrument } from '../../generated/sdk';
import { useCallsData } from '../../hooks/useCallsData';
import { tableIcons } from '../../utils/materialIcons';
import ScienceIconAdd from '../common/ScienceIconAdd';
import AssignedInstrumentsTable from './AssignedInstrumentsTable';
import AssignInstrumentsToCall from './AssignInstrumentsToCall';
import CreateUpdateCall from './CreateUpdateCall';
import { ActionButtonContainer } from '../common/ActionButtonContainer';
import UOSDialog from '../common/UOSDialog';

type CallsTableProps = {
  templateId?: number;
};

const CallsTable: React.FC<CallsTableProps> = ({ templateId }) => {
  const [show, setShow] = useState(false);
  const { loading, callsData, setCallsData } = useCallsData(
    undefined,
    templateId
  );
  const [editCall, setEditCall] = useState<Call | null>(null);
  const [assigningInstrumentsCallId, setAssigningInstrumentsCallId] = useState<
    number | null
  >(null);

  if (loading) {
    return <p>Loading...</p>;
  }

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
  ];

  const onCallCreated = (callAdded: Call | null) => {
    callAdded && setCallsData([...(callsData as Call[]), callAdded]);

    setShow(false);
  };

  const onCallUpdated = (callUpdated: Call | null) => {
    if (callUpdated) {
      const newCallsArray = (callsData as Call[]).map(callItem =>
        callItem.id === callUpdated.id ? callUpdated : callItem
      );

      setCallsData(newCallsArray);
    }

    setEditCall(null);
  };

  const assignInstrumentsToCall = (instruments: Instrument[]) => {
    if (callsData) {
      const newCallsData = callsData.map(callItem => {
        if (callItem.id === assigningInstrumentsCallId) {
          return {
            ...callItem,
            instruments: [...callItem.instruments, ...instruments],
          };
        } else {
          return callItem;
        }
      });

      setCallsData(newCallsData);
      setAssigningInstrumentsCallId(null);
    }
  };

  const removeAssignedInstrumentFromCall = (
    instrumentToRemoveId: number,
    callToRemoveFromId: number
  ) => {
    if (callsData) {
      const newCallsData = callsData.map(callItem => {
        if (callItem.id === callToRemoveFromId) {
          const newInstruments = callItem.instruments.filter(
            instrumentItem =>
              instrumentItem.instrumentId !== instrumentToRemoveId
          );

          return {
            ...callItem,
            instruments: newInstruments,
          };
        } else {
          return callItem;
        }
      });

      setCallsData(newCallsData);
      setAssigningInstrumentsCallId(null);
    }
  };

  const EditIcon = (): JSX.Element => <Edit />;
  const ScienceIconComponent = (): JSX.Element => <ScienceIconAdd />;

  const AssignedInstruments = (rowData: Call) => (
    <AssignedInstrumentsTable
      call={rowData}
      removeAssignedInstrumentFromCall={removeAssignedInstrumentFromCall}
    />
  );

  const callAssignments = callsData?.find(
    callItem => callItem.id === assigningInstrumentsCallId
  );

  return (
    <>
      <UOSDialog
        maxWidth="xs"
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!editCall || show}
        onClose={(): void => (!!editCall ? setEditCall(null) : setShow(false))}
      >
        <CreateUpdateCall
          call={editCall}
          close={(call): void => {
            !!editCall ? onCallUpdated(call) : onCallCreated(call);
          }}
        />
      </UOSDialog>
      {assigningInstrumentsCallId && (
        <UOSDialog
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={!!assigningInstrumentsCallId}
          onClose={(): void => setAssigningInstrumentsCallId(null)}
        >
          <AssignInstrumentsToCall
            assignedInstruments={callAssignments?.instruments}
            callId={assigningInstrumentsCallId}
            assignInstrumentsToCall={(instruments: Instrument[]) =>
              assignInstrumentsToCall(instruments)
            }
          />
        </UOSDialog>
      )}
      <MaterialTable
        icons={tableIcons}
        title="Calls"
        columns={columns}
        data={callsData as Call[]}
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
            icon: EditIcon,
            tooltip: 'Edit Call',
            onClick: (event, rowData): void => setEditCall(rowData as Call),
            position: 'row',
          },
          {
            icon: ScienceIconComponent,
            tooltip: 'Assign Instrument',
            onClick: (event, rowData): void =>
              setAssigningInstrumentsCallId((rowData as Call).id),
            position: 'row',
          },
        ]}
      />
      <ActionButtonContainer>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => setShow(true)}
          data-cy="add-call"
        >
          Add call
        </Button>
      </ActionButtonContainer>
    </>
  );
};

CallsTable.propTypes = {
  templateId: PropTypes.number,
};

export default CallsTable;
