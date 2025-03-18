import AssignmentInd from '@mui/icons-material/AssignmentInd';
import { t } from 'i18next';
import React, { useState } from 'react';

import ScienceIcon from 'components/common/icons/ScienceIcon';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import ParticipantModal from 'components/proposal/ParticipantModal';
import {
  BasicUserDetails,
  InstrumentMinimalFragment,
  UserRole,
} from 'generated/sdk';
import {
  FacilityData,
  useFacilitiesData,
} from 'hooks/facility/useFacilitiesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import { CreateUpdateFacility } from './CreateUpdateFacility';
import { FacilityDetailsPanel } from './FacilityDetailsPanel';
import { SelectInstrumentModel } from './SelectInstrumentModel';

const facilitiesColumns = [
  {
    title: 'Name',
    field: 'name',
  },
  {
    title: 'Short code',
    field: 'shortCode',
  },
];

const FacilityTable = () => {
  const { facilities, loadingFacilities, setFacilitiesWithLoading } =
    useFacilitiesData();
  const [assigningUserFacilityId, setAssigningUserFacilityId] = useState<
    number | null
  >(null);
  const [assigningInstrumentFacilityId, setAssigningInstrumentFacilityId] =
    useState<number | null>(null);
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const createModal = (
    onUpdate: FunctionType<void, [FacilityData | null]>,
    onCreate: FunctionType<void, [FacilityData | null]>,
    editFacility: FacilityData | null
  ) => (
    <CreateUpdateFacility
      facility={editFacility}
      close={(call): void => {
        !!editFacility ? onUpdate(call) : onCreate(call);
      }}
    />
  );

  const assignUsersToFacility = async (users: BasicUserDetails[]) => {
    api().assignUsersToFacility({
      userIds: users.map((user) => user.id),
      facilityId: assigningUserFacilityId as number,
    });
    setFacilitiesWithLoading(
      facilities.map((facility) =>
        facility.id === assigningUserFacilityId
          ? { ...facility, users: facility.users.concat(users) }
          : facility
      )
    );
    setAssigningUserFacilityId(null);
  };

  const assignInstrumentsToFacility = async (
    instruments: InstrumentMinimalFragment[]
  ) => {
    api().assignInstrumentsToFacility({
      instrumentIds: instruments.map((instrument) => instrument.id),
      facilityId: assigningInstrumentFacilityId as number,
    });
    setFacilitiesWithLoading(
      facilities.map((facility) =>
        facility.id === assigningInstrumentFacilityId
          ? {
              ...facility,
              instruments: facility.instruments.concat(instruments),
            }
          : facility
      )
    );
    setAssigningInstrumentFacilityId(null);
  };

  const AssignUserIcon = (): JSX.Element => <AssignmentInd />;
  const AssignInstrumentIcon = (): JSX.Element => <ScienceIcon />;

  const userAssignments = facilities?.find(
    (facility) => facility.id === assigningUserFacilityId
  );

  const instrumentsAssignments = facilities?.find(
    (facility) => facility.id === assigningInstrumentFacilityId
  );

  const removeUser = (userId: number, facilityId: number) => {
    setFacilitiesWithLoading(
      facilities.map((facility) =>
        facility.id === facilityId
          ? {
              ...facility,
              users: facility.users.filter((u) => u.id !== userId),
            }
          : facility
      )
    );
  };

  const removeInstrument = (instrumentId: number, facilityId: number) => {
    setFacilitiesWithLoading(
      facilities.map((facility) =>
        facility.id === facilityId
          ? {
              ...facility,
              instruments: facility.instruments.filter(
                (i) => i.id !== instrumentId
              ),
            }
          : facility
      )
    );
  };

  return (
    <>
      <ParticipantModal
        show={!!assigningUserFacilityId}
        close={(): void => setAssigningUserFacilityId(null)}
        addParticipants={assignUsersToFacility}
        selectedUsers={userAssignments?.users.map((user) => user.id) ?? []}
        selection={true}
        userRole={UserRole.INSTRUMENT_SCIENTIST}
        title={t('instrumentSci')}
        invitationUserRole={UserRole.INSTRUMENT_SCIENTIST}
      />
      <SelectInstrumentModel
        facilityId={assigningInstrumentFacilityId ?? 0}
        preSelectedInstruments={instrumentsAssignments?.instruments.map(
          (instrument) => instrument.id
        )}
        open={!!assigningInstrumentFacilityId}
        close={(): void => setAssigningInstrumentFacilityId(null)}
        addInstruments={assignInstrumentsToFacility}
      />
      <div data-cy="facility-table">
        <SuperMaterialTable
          columns={facilitiesColumns}
          createModal={createModal}
          title={'Facilities'}
          data={facilities}
          options={{
            search: false,
            paging: false,
            headerStyle: { backgroundColor: '#fafafa' },
          }}
          isLoading={loadingFacilities || isExecutingCall}
          setData={setFacilitiesWithLoading}
          detailPanel={(rowData) => {
            return (
              <FacilityDetailsPanel
                facility={rowData.rowData}
                removeUser={removeUser}
                removeInstrument={removeInstrument}
              />
            );
          }}
          actions={[
            {
              icon: AssignUserIcon,
              tooltip: 'Assign scientist',
              onClick: (_event, rowdata) => {
                setAssigningUserFacilityId((rowdata as FacilityData).id);
              },
            },
            {
              icon: AssignInstrumentIcon,
              tooltip: 'Assign TODO',
              onClick: (_event, rowdata) => {
                setAssigningInstrumentFacilityId((rowdata as FacilityData).id);
              },
            },
          ]}
        />
      </div>
    </>
  );
};

export default FacilityTable;
