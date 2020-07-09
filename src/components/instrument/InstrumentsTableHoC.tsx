import { AssignmentInd } from '@material-ui/icons';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { BasicUserDetails, Instrument, UserRole } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { useInstrumentsData } from '../../hooks/useInstrumentsData';
import { withCRUD } from '../common/HoCTableCRUD';
import ParticipantModal from '../proposal/ParticipantModal';
import AssignedScientistsTable from './AssignedScientistsTable';
import CreateUpdateInstrument from './CreateUpdateInstrument';
const InstrumentsTable: React.FC = () => {
  const { loading, instrumentsData, setInstrumentsData } = useInstrumentsData();

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Short code', field: 'shortCode' },
    { title: 'Description', field: 'description' },
    {
      title: 'Scientists',
      render: (rowData: Record<string, any>) =>
        rowData.scientists.length > 0 ? rowData.scientists.length : '-',
    },
  ];
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [assigningInstrumentId, setAssigningInstrumentId] = useState<
    number | null
  >(null);

  if (loading) {
    return <p>Loading...</p>;
  }

  const onInstrumentDelete = async (instrumentDeletedId: number) => {
    const deleteInstrumentResult = await api().deleteInstrument({
      instrumentId: instrumentDeletedId,
    });

    const isError = !!deleteInstrumentResult.deleteInstrument.error;

    return isError;
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

  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;

  const AssignedScientists = (rowData: Record<string, any>) => (
    <AssignedScientistsTable
      instrument={rowData as Instrument}
      removeAssignedScientistFromInstrument={
        removeAssignedScientistFromInstrument
      }
    />
  );

  const createModal = (
    onUpdate: Function,
    onCreate: Function,
    instrument: any
  ) => (
    <CreateUpdateInstrument
      instrument={instrument as Instrument}
      close={(instrument: Instrument | null) =>
        !!instrument ? onUpdate(instrument) : onCreate(instrument)
      }
    />
  );
  const instrumentAssignments = instrumentsData?.find(
    instrumentItem => instrumentItem.instrumentId === assigningInstrumentId
  );
  const InstrumentTable = withCRUD(MaterialTable);

  return (
    <>
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
        <InstrumentTable
          delete={onInstrumentDelete}
          setData={setInstrumentsData}
          title={'Instruments'}
          columns={columns}
          data={instrumentsData}
          createModal={createModal}
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
          actions={[
            {
              icon: AssignmentIndIcon,
              tooltip: 'Assign scientist',
              onClick: (_event: unknown, rowData: unknown): void =>
                setAssigningInstrumentId((rowData as Instrument).instrumentId),
            },
          ]}
        />
      </div>
    </>
  );
};

export default InstrumentsTable;
