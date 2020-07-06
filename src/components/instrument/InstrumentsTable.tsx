import { Button } from '@material-ui/core';
import { AssignmentInd, Edit } from '@material-ui/icons';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { BasicUserDetails, Instrument, UserRole } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useInstrumentsData } from '../../hooks/useInstrumentsData';
import { tableIcons } from '../../utils/materialIcons';
import { ActionButtonContainer } from '../common/ActionButtonContainer';
import Can from '../common/Can';
import InputDialog from '../common/InputDialog';
import ParticipantModal from '../proposal/ParticipantModal';
import AssignedScientistsTable from './AssignedScientistsTable';
import CreateUpdateInstrument from './CreateUpdateInstrument';

const InstrumentsTable: React.FC = () => {
  const [show, setShow] = useState(false);
  const {
    loadingInstruments,
    instrumentsData,
    setInstrumentsData,
  } = useInstrumentsData();

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
    {
      title: 'Scientists',
      render: (rowData: Instrument) =>
        rowData.scientists.length > 0 ? rowData.scientists.length : '-',
    },
  ];
  const [editInstrument, setEditInstrument] = useState<Instrument | null>(null);
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [assigningInstrumentId, setAssigningInstrumentId] = useState<
    number | null
  >(null);

  if (loadingInstruments) {
    return <p>Loading...</p>;
  }

  const onInstrumentCreated = (instrumentAdded: Instrument | null) => {
    instrumentAdded &&
      setInstrumentsData([...instrumentsData, instrumentAdded]);

    setShow(false);
  };

  const onInstrumentUpdated = (instrumentUpdated: Instrument | null) => {
    if (instrumentUpdated) {
      const newInstrumentsArray = instrumentsData.map(instrumentItem =>
        instrumentItem.instrumentId === instrumentUpdated.instrumentId
          ? instrumentUpdated
          : instrumentItem
      );

      setInstrumentsData(newInstrumentsArray);
    }

    setEditInstrument(null);
  };

  const onInstrumentDelete = async (instrumentDeletedId: number) => {
    const deleteInstrumentResult = await api().deleteInstrument({
      instrumentId: instrumentDeletedId,
    });

    const isError = !!deleteInstrumentResult.deleteInstrument.error;

    enqueueSnackbar('Instrument deleted', {
      variant: isError ? 'error' : 'success',
    });

    if (!isError) {
      const newInstrumentsArray = instrumentsData.filter(
        instrumentItem => instrumentItem.instrumentId !== instrumentDeletedId
      );

      setInstrumentsData(newInstrumentsArray);
    }
  };

  const assignScientistsToInstrument = async (scientist: BasicUserDetails) => {
    const assignScientistToInstrumentResult = await api().assignScientistsToInstrument(
      {
        instrumentId: assigningInstrumentId as number,
        scientistIds: [scientist.id],
      }
    );

    if (!assignScientistToInstrumentResult.assignScientistsToInstrument.error) {
      if (!scientist.organisation) {
        scientist.organisation = 'Other';
      }

      if (instrumentsData) {
        const newInstrumentsData = instrumentsData.map(instrumentItem => {
          if (instrumentItem.instrumentId === assigningInstrumentId) {
            return {
              ...instrumentItem,
              scientists: [...instrumentItem.scientists, { ...scientist }],
            };
          } else {
            return instrumentItem;
          }
        });

        setInstrumentsData(newInstrumentsData);
      }
    }

    const errorMessage = assignScientistToInstrumentResult
      .assignScientistsToInstrument.error
      ? 'Could not assign scientist to instrument'
      : 'Scientist assigned to instrument';

    enqueueSnackbar(errorMessage, {
      variant: assignScientistToInstrumentResult.assignScientistsToInstrument
        .error
        ? 'error'
        : 'success',
    });

    setAssigningInstrumentId(null);
  };

  const removeAssignedScientistFromInstrument = (
    scientistToRemoveId: number,
    instrumentToRemoveFromId: number
  ) => {
    if (instrumentsData) {
      const newInstrumentsData = instrumentsData.map(instrumentItem => {
        if (instrumentItem.instrumentId === instrumentToRemoveFromId) {
          const newScientists = instrumentItem.scientists.filter(
            scientistItem => scientistItem.id !== scientistToRemoveId
          );

          return {
            ...instrumentItem,
            scientists: newScientists,
          };
        } else {
          return instrumentItem;
        }
      });

      setInstrumentsData(newInstrumentsData);
      setAssigningInstrumentId(null);
    }
  };

  const EditIcon = (): JSX.Element => <Edit />;
  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;

  const AssignedScientists = (rowData: Instrument) => (
    <AssignedScientistsTable
      instrument={rowData}
      removeAssignedScientistFromInstrument={
        removeAssignedScientistFromInstrument
      }
    />
  );

  const instrumentAssignments = instrumentsData?.find(
    instrumentItem => instrumentItem.instrumentId === assigningInstrumentId
  );

  return (
    <>
      <InputDialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={!!editInstrument || show}
        onClose={(): void =>
          !!editInstrument ? setEditInstrument(null) : setShow(false)
        }
      >
        <CreateUpdateInstrument
          instrument={editInstrument as Instrument}
          close={(instrument: Instrument | null) =>
            !!editInstrument
              ? onInstrumentUpdated(instrument)
              : onInstrumentCreated(instrument)
          }
        />
      </InputDialog>
      <ParticipantModal
        show={!!assigningInstrumentId}
        close={(): void => setAssigningInstrumentId(null)}
        addParticipant={assignScientistsToInstrument}
        selectedUsers={instrumentAssignments?.scientists.map(
          scientist => scientist.id
        )}
        userRole={UserRole.INSTRUMENT_SCIENTIST}
        title={'Instrument scientist'}
        invitationUserRole={UserRole.INSTRUMENT_SCIENTIST}
      />
      <div data-cy="instruments-table">
        <MaterialTable
          icons={tableIcons}
          title={'Instruments'}
          columns={columns}
          data={instrumentsData}
          detailPanel={[
            {
              tooltip: 'Show Instruments',
              render: AssignedScientists,
            },
          ]}
          options={{
            search: true,
            debounceInterval: 400,
          }}
          editable={{
            onRowDelete: (rowInstrumentData: Instrument): Promise<void> =>
              onInstrumentDelete(rowInstrumentData.instrumentId),
          }}
          actions={[
            {
              icon: EditIcon,
              tooltip: 'Edit Instrument',
              onClick: (event, rowData) =>
                setEditInstrument(rowData as Instrument),
              position: 'row',
            },
            {
              icon: AssignmentIndIcon,
              tooltip: 'Assign scientist',
              onClick: (event, rowData): void =>
                setAssigningInstrumentId((rowData as Instrument).instrumentId),
              position: 'row',
            },
          ]}
        />
        <Can
          allowedRoles={[UserRole.USER_OFFICER]}
          yes={() => (
            <ActionButtonContainer>
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={() => setShow(true)}
              >
                Create instrument
              </Button>
            </ActionButtonContainer>
          )}
          no={() => null}
        ></Can>
      </div>
    </>
  );
};

export default InstrumentsTable;
