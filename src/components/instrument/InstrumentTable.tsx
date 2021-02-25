import AssignmentInd from '@material-ui/icons/AssignmentInd';
import React, { useState } from 'react';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import { BasicUserDetails, Instrument, UserRole } from '../../generated/sdk';
import ParticipantModal from '../proposal/ParticipantModal';
import AssignedScientistsTable from './AssignedScientistsTable';
import CreateUpdateInstrument from './CreateUpdateInstrument';

const InstrumentTable: React.FC = () => {
  const {
    loadingInstruments,
    instruments,
    setInstrumentsWithLoading: setInstruments,
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
  const { api } = useDataApiWithFeedback();
  const [assigningInstrumentId, setAssigningInstrumentId] = useState<
    number | null
  >(null);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [
    urlQueryParams,
    setUrlQueryParams,
  ] = useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const onInstrumentDelete = async (instrumentDeletedId: number | string) => {
    return await api('Instrument removed successfully!')
      .deleteInstrument({
        id: instrumentDeletedId as number,
      })
      .then((data) => {
        if (data.deleteInstrument.error) {
          return false;
        } else {
          return true;
        }
      });
  };

  const assignScientistsToInstrument = async (
    scientists: BasicUserDetails[]
  ) => {
    const assignScientistToInstrumentResult = await api(
      'Scientist assigned to instrument successfully!'
    ).assignScientistsToInstrument({
      instrumentId: assigningInstrumentId as number,
      scientistIds: scientists.map((scientist) => scientist.id),
    });

    if (!assignScientistToInstrumentResult.assignScientistsToInstrument.error) {
      scientists = scientists.map((scientist) => {
        if (!scientist.organisation) {
          scientist.organisation = 'Other';
        }

        return scientist;
      });

      if (instruments) {
        const newInstrumentsData = instruments.map((instrumentItem) => {
          if (instrumentItem.id === assigningInstrumentId) {
            return {
              ...instrumentItem,
              scientists: [...instrumentItem.scientists, ...scientists],
            };
          } else {
            return instrumentItem;
          }
        });

        setInstruments(newInstrumentsData);
      }
    }

    setAssigningInstrumentId(null);
  };

  const removeAssignedScientistFromInstrument = (
    scientistToRemoveId: number,
    instrumentToRemoveFromId: number
  ) => {
    if (instruments) {
      const newInstrumentsData = instruments.map((instrumentItem) => {
        if (instrumentItem.id === instrumentToRemoveFromId) {
          const newScientists = instrumentItem.scientists.filter(
            (scientistItem) => scientistItem.id !== scientistToRemoveId
          );

          return {
            ...instrumentItem,
            scientists: newScientists,
          };
        } else {
          return instrumentItem;
        }
      });

      setInstruments(newInstrumentsData);
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
    onUpdate: FunctionType<void, [Instrument | null]>,
    onCreate: FunctionType<void, [Instrument | null]>,
    editInstrument: Instrument | null
  ) => (
    <CreateUpdateInstrument
      instrument={editInstrument}
      close={(instrument: Instrument | null) =>
        !!editInstrument ? onUpdate(instrument) : onCreate(instrument)
      }
    />
  );
  const instrumentAssignments = instruments?.find(
    (instrumentItem) => instrumentItem.id === assigningInstrumentId
  );

  return (
    <>
      <ParticipantModal
        show={!!assigningInstrumentId}
        close={(): void => setAssigningInstrumentId(null)}
        addParticipants={assignScientistsToInstrument}
        selectedUsers={instrumentAssignments?.scientists.map(
          (scientist) => scientist.id
        )}
        selection={true}
        userRole={UserRole.INSTRUMENT_SCIENTIST}
        title={'Instrument scientist'}
        invitationUserRole={UserRole.INSTRUMENT_SCIENTIST}
      />
      <div data-cy="instruments-table">
        <SuperMaterialTable
          delete={onInstrumentDelete}
          setData={setInstruments}
          hasAccess={{
            create: isUserOfficer,
            update: isUserOfficer,
            remove: isUserOfficer,
          }}
          title={'Instruments'}
          columns={columns}
          data={instruments}
          isLoading={loadingInstruments}
          createModal={createModal}
          detailPanel={[
            {
              tooltip: 'Show Scientists',
              render: AssignedScientists,
            },
          ]}
          options={{
            search: true,
            debounceInterval: 400,
          }}
          actions={
            isUserOfficer
              ? [
                  {
                    icon: AssignmentIndIcon,
                    tooltip: 'Assign scientist',
                    onClick: (_event: unknown, rowData: unknown): void =>
                      setAssigningInstrumentId((rowData as Instrument).id),
                  },
                ]
              : []
          }
          urlQueryParams={urlQueryParams}
          setUrlQueryParams={setUrlQueryParams}
        />
      </div>
    </>
  );
};

export default InstrumentTable;
