import AssignmentInd from '@mui/icons-material/AssignmentInd';
import { Typography } from '@mui/material';
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

import {
  BasicUserDetails,
  InstrumentFragment,
  UserRole,
} from '../../generated/sdk';
import ParticipantModal from '../proposal/ParticipantModal';
import AssignedScientistsTable from './AssignedScientistsTable';
import CreateUpdateInstrument from './CreateUpdateInstrument';

const columns = [
  { title: 'Name', field: 'name' },
  { title: 'Short code', field: 'shortCode' },
  { title: 'Description', field: 'description' },
  {
    title: 'Scientists',
    field: 'scientists.length',
    emptyValue: '-',
  },
];

const InstrumentTable: React.FC = () => {
  const {
    loadingInstruments,
    instruments,
    setInstrumentsWithLoading: setInstruments,
  } = useInstrumentsData();

  const { api } = useDataApiWithFeedback();
  const [assigningInstrumentId, setAssigningInstrumentId] = useState<
    number | null
  >(null);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const onInstrumentDelete = async (instrumentDeletedId: number | string) => {
    return await api({
      toastSuccessMessage: 'Instrument removed successfully!',
    })
      .deleteInstrument({
        id: instrumentDeletedId as number,
      })
      .then((data) => {
        if (data.deleteInstrument.rejection) {
          return false;
        } else {
          return true;
        }
      });
  };

  const assignScientistsToInstrument = async (
    scientists: BasicUserDetails[]
  ) => {
    const assignScientistToInstrumentResult = await api({
      toastSuccessMessage: 'Scientist assigned to instrument successfully!',
    }).assignScientistsToInstrument({
      instrumentId: assigningInstrumentId as number,
      scientistIds: scientists.map((scientist) => scientist.id),
    });

    if (
      !assignScientistToInstrumentResult.assignScientistsToInstrument.rejection
    ) {
      scientists = scientists.map((scientist) => {
        if (!scientist.organisation) {
          scientist.organisation = 'Other';
        }

        return scientist;
      });

      setInstruments((instruments) =>
        instruments.map((instrumentItem) => {
          if (instrumentItem.id === assigningInstrumentId) {
            return {
              ...instrumentItem,
              scientists: [...instrumentItem.scientists, ...scientists],
            };
          } else {
            return instrumentItem;
          }
        })
      );
    }

    setAssigningInstrumentId(null);
  };

  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;

  const AssignedScientists = React.useCallback(
    ({ rowData }) => {
      const removeAssignedScientistFromInstrument = (
        scientistToRemoveId: number,
        instrumentToRemoveFromId: number
      ) => {
        setInstruments((instruments) =>
          instruments.map((instrumentItem) => {
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
          })
        );
        setAssigningInstrumentId(null);
      };

      return (
        <AssignedScientistsTable
          instrument={rowData}
          removeAssignedScientistFromInstrument={
            removeAssignedScientistFromInstrument
          }
        />
      );
    },
    [setInstruments, setAssigningInstrumentId]
  );

  const createModal = (
    onUpdate: FunctionType<void, [InstrumentFragment | null]>,
    onCreate: FunctionType<void, [InstrumentFragment | null]>,
    editInstrument: InstrumentFragment | null
  ) => (
    <CreateUpdateInstrument
      instrument={editInstrument}
      close={(instrument: InstrumentFragment | null) =>
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
          title={
            <Typography variant="h6" component="h2">
              Instruments
            </Typography>
          }
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
                      setAssigningInstrumentId(
                        (rowData as InstrumentFragment).id
                      ),
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
