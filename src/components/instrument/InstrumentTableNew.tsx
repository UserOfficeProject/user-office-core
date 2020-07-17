import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { AssignmentInd } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { useDataApi } from 'hooks/common/useDataApi';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';

import { BasicUserDetails, Instrument, UserRole } from '../../generated/sdk';
import ParticipantModal from '../proposal/ParticipantModal';
import AssignedScientistsTable from './AssignedScientistsTable';
import CreateUpdateInstrument from './CreateUpdateInstrument';
const InstrumentsTable: React.FC = () => {
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
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [assigningInstrumentId, setAssigningInstrumentId] = useState<
    number | null
  >(null);

  if (loadingInstruments) {
    return <p>Loading...</p>;
  }

  const onInstrumentDelete = async (instrumentDeletedId: number) => {
    return await api()
      .deleteInstrument({
        id: instrumentDeletedId,
      })
      .then(data => {
        if (data.deleteInstrument.error) {
          enqueueSnackbar(
            getTranslation(data.deleteInstrument.error as ResourceId),
            {
              variant: 'error',
            }
          );

          return true;
        } else {
          return false;
        }
      });
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
          if (instrumentItem.id === assigningInstrumentId) {
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
        if (instrumentItem.id === instrumentToRemoveFromId) {
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

  const AssignedScientists = (rowData: Instrument) => (
    <AssignedScientistsTable
      instrument={rowData}
      removeAssignedScientistFromInstrument={
        removeAssignedScientistFromInstrument
      }
    />
  );

  const createModal = (
    onUpdate: Function,
    onCreate: Function,
    editInstrument: Instrument | null
  ) => (
    <CreateUpdateInstrument
      instrument={editInstrument}
      close={(instrument: Instrument | null) =>
        !!editInstrument ? onUpdate(instrument) : onCreate(instrument)
      }
    />
  );
  const instrumentAssignments = instrumentsData?.find(
    instrumentItem => instrumentItem.id === assigningInstrumentId
  );

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
        <SuperMaterialTable
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
                setAssigningInstrumentId((rowData as Instrument).id),
            },
          ]}
        />
      </div>
    </>
  );
};

export default InstrumentsTable;
