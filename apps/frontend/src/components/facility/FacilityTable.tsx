import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ScienceIcon from 'components/common/icons/ScienceIcon';
import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { Call, InstrumentMinimalFragment } from 'generated/sdk';
import {
  FacilityData,
  useFacilitiesData,
} from 'hooks/facility/useFacilitiesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import { CreateUpdateFacility } from './CreateUpdateFacility';
import { FacilityDetailsPanel } from './FacilityDetailsPanel';
import { SelectCallModel } from './SelectCallModel';
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
  const [assigningCallFacilityId, setAssigningCallFacilityId] = useState<
    number | null
  >(null);
  const [assigningInstrumentFacilityId, setAssigningInstrumentFacilityId] =
    useState<number | null>(null);
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

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

  const assignCallsToFacility = async (
    calls: Pick<Call, 'id' | 'shortCode'>[]
  ) => {
    api().assignCallsToFacility({
      callIds: calls.map((call) => call.id),
      facilityId: assigningCallFacilityId as number,
    });

    setFacilitiesWithLoading(
      facilities.map((facility) =>
        facility.id === assigningCallFacilityId
          ? {
              ...facility,
              calls: facility.calls.concat(calls),
            }
          : facility
      )
    );

    setAssigningCallFacilityId(null);
  };

  const AssignInstrumentIcon = (): JSX.Element => <ScienceIcon />;

  const AssignCallIcon = (): JSX.Element => <CalendarTodayIcon />;

  const instrumentsAssignments = facilities?.find(
    (facility) => facility.id === assigningInstrumentFacilityId
  );

  const callAssignments = facilities?.find(
    (facility) => facility.id === assigningCallFacilityId
  );

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

  const removeCall = (callId: number, facilityId: number) => {
    setFacilitiesWithLoading(
      facilities.map((facility) =>
        facility.id === facilityId
          ? {
              ...facility,
              calls: facility.calls.filter((i) => i.id !== callId),
            }
          : facility
      )
    );
  };

  return (
    <>
      <SelectInstrumentModel
        facilityId={assigningInstrumentFacilityId ?? 0}
        preSelectedInstruments={instrumentsAssignments?.instruments.map(
          (instrument) => instrument.id
        )}
        open={!!assigningInstrumentFacilityId}
        close={(): void => setAssigningInstrumentFacilityId(null)}
        addInstruments={assignInstrumentsToFacility}
      />
      <SelectCallModel
        facilityId={assigningCallFacilityId ?? 0}
        preSelectedCalls={callAssignments?.calls.map((call) => call.id)}
        open={!!assigningCallFacilityId}
        close={(): void => setAssigningCallFacilityId(null)}
        addCalls={assignCallsToFacility}
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
          }}
          isLoading={loadingFacilities || isExecutingCall}
          setData={setFacilitiesWithLoading}
          detailPanel={(rowData) => {
            return (
              <FacilityDetailsPanel
                facility={rowData.rowData}
                removeInstrument={removeInstrument}
                removeCall={removeCall}
              />
            );
          }}
          actions={[
            {
              icon: AssignInstrumentIcon,
              tooltip: `Assign ${t('instrument')}`,
              onClick: (_event, rowdata) => {
                setAssigningInstrumentFacilityId((rowdata as FacilityData).id);
              },
            },
            {
              icon: AssignCallIcon,
              tooltip: `Assign Call`,
              onClick: (_event, rowdata) => {
                setAssigningCallFacilityId((rowdata as FacilityData).id);
              },
            },
          ]}
        />
      </div>
    </>
  );
};

export default FacilityTable;
