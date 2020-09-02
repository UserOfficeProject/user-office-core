import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import AssignmentInd from '@material-ui/icons/AssignmentInd';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import {
  useQueryParams,
  StringParam,
  withDefault,
  DelimitedNumericArrayParam,
} from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { useDataApi } from 'hooks/common/useDataApi';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';

import { BasicUserDetails, Instrument, UserRole } from '../../generated/sdk';
import ParticipantModal from '../proposal/ParticipantModal';
import AssignedScientistsTable from './AssignedScientistsTable';
import CreateUpdateInstrument from './CreateUpdateInstrument';

const InstrumentTable: React.FC = () => {
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
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType
  >({
    search: StringParam,
    selection: withDefault(DelimitedNumericArrayParam, []),
  });

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

  const assignScientistsToInstrument = async (
    scientists: BasicUserDetails[]
  ) => {
    const assignScientistToInstrumentResult = await api().assignScientistsToInstrument(
      {
        instrumentId: assigningInstrumentId as number,
        scientistIds: scientists.map(scientist => scientist.id),
      }
    );

    if (!assignScientistToInstrumentResult.assignScientistsToInstrument.error) {
      scientists = scientists.map(scientist => {
        if (!scientist.organisation) {
          scientist.organisation = 'Other';
        }

        return scientist;
      });

      if (instrumentsData) {
        const newInstrumentsData = instrumentsData.map(instrumentItem => {
          if (instrumentItem.id === assigningInstrumentId) {
            return {
              ...instrumentItem,
              scientists: [...instrumentItem.scientists, ...scientists],
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
        addParticipants={assignScientistsToInstrument}
        selectedUsers={instrumentAssignments?.scientists.map(
          scientist => scientist.id
        )}
        selection={true}
        userRole={UserRole.INSTRUMENT_SCIENTIST}
        title={'Instrument scientist'}
        invitationUserRole={UserRole.INSTRUMENT_SCIENTIST}
      />
      <div data-cy="instruments-table">
        <SuperMaterialTable
          delete={onInstrumentDelete}
          setData={setInstrumentsData}
          hasAccess={{
            create: isUserOfficer,
            update: isUserOfficer,
            remove: isUserOfficer,
          }}
          title={'Instruments'}
          columns={columns}
          data={instrumentsData}
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
