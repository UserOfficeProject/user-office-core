import { Column } from '@material-table/core';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import { Typography } from '@mui/material';
import i18n from 'i18n';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'use-query-params';

import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { useInstrumentsData } from 'hooks/instrument/useInstrumentsData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import AssignedScientistsTable from './AssignedScientistsTable';
import CreateUpdateInstrument from './CreateUpdateInstrument';
import {
  BasicUserDetails,
  InstrumentFragment,
  UserRole,
} from '../../generated/sdk';
import ParticipantModal from '../proposal/ParticipantModal';

const columns: Column<InstrumentFragment>[] = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Short code',
    field: 'shortCode',
  },
  {
    title: 'Description',
    field: 'description',
  },
  {
    title: 'Scientists',
    render: (data) => data.scientists.length,
  },
];

const InstrumentTable = () => {
  const { loadingInstruments, instruments, setInstruments } =
    useInstrumentsData();

  const { api } = useDataApiWithFeedback();
  const { t } = useTranslation();
  const [assigningInstrumentId, setAssigningInstrumentId] = useState<
    number | null
  >(null);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const onInstrumentDelete = async (instrumentDeletedId: number | string) => {
    try {
      await api({
        toastSuccessMessage: t('instrument') + ' removed successfully!',
      }).deleteInstrument({
        id: instrumentDeletedId as number,
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const assignScientistsToInstrument = async (
    scientists: BasicUserDetails[]
  ) => {
    await api({
      toastSuccessMessage: `Scientist assigned to ${i18n.format(
        t('instrument'),
        'lowercase'
      )} successfully!`,
    }).assignScientistsToInstrument({
      instrumentId: assigningInstrumentId as number,
      scientistIds: scientists.map((scientist) => scientist.id),
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

    setAssigningInstrumentId(null);
  };

  const AssignmentIndIcon = (): JSX.Element => <AssignmentInd />;

  const AssignedScientists = React.useCallback(
    ({ rowData }: { rowData: InstrumentFragment }) => {
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
        title={t('instrumentSci')}
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
              {i18n.format(t('instrument'), 'plural')}
            </Typography>
          }
          columns={columns}
          data={instruments}
          isLoading={loadingInstruments}
          createModal={createModal}
          detailPanel={[
            {
              tooltip: 'Show Manager and Scientists',
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
