import MaterialTable from '@material-table/core';
import { Delete } from '@mui/icons-material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Call, InstrumentMinimalFragment } from 'generated/sdk';
import { FacilityData } from 'hooks/facility/useFacilitiesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export const FacilityDetailsPanel = ({
  facility,
  removeInstrument,
  removeCall,
}: {
  facility: FacilityData;
  removeInstrument: (instrumentId: number, facilityId: number) => void;
  removeCall: (callId: number, facilityId: number) => void;
}) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();
  const { t } = useTranslation();

  const callRowActions = [
    {
      icon: () => <Delete />,
      tooltip: 'Remove Call',
      onClick: (
        event: React.MouseEvent<HTMLElement>,
        rowData:
          | Pick<Call, 'id' | 'shortCode'>
          | Pick<Call, 'id' | 'shortCode'>[]
      ) => {
        // It will always be a singleton not a array but the type checker needs the array
        const call = rowData as Pick<Call, 'id' | 'shortCode'>;

        api().removeCallFromFacility({
          callId: call.id,
          facilityId: facility.id,
        });
        removeCall(call.id, facility.id);
      },
    },
  ];

  const instrumentRowActions = [
    {
      icon: () => <Delete />,
      tooltip: `Remove ${t('instrument')}`,
      onClick: (
        event: React.MouseEvent<JSX.Element>,
        rowData: InstrumentMinimalFragment | InstrumentMinimalFragment[]
      ) => {
        const instrument = rowData as InstrumentMinimalFragment;

        api().removeInstrumentFromFacility({
          instrumentId: instrument.id,
          facilityId: facility.id,
        });
        removeInstrument(instrument.id, facility.id);
      },
    },
  ];

  return (
    <>
      <MaterialTable
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Description', field: 'description' },
        ]}
        data={facility.instruments}
        isLoading={isExecutingCall}
        title="Instruments"
        options={{
          selection: false,
        }}
        actions={instrumentRowActions}
      />
      <MaterialTable
        columns={[{ title: 'ShortCode', field: 'shortCode' }]}
        data={facility.calls}
        isLoading={isExecutingCall}
        title="Calls"
        options={{
          selection: false,
        }}
        actions={callRowActions}
      />
    </>
  );
};
