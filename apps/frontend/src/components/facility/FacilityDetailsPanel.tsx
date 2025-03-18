import MaterialTable from '@material-table/core';
import { Delete } from '@mui/icons-material';
import React from 'react';

import { BasicUserDetails, InstrumentMinimalFragment } from 'generated/sdk';
import { FacilityData } from 'hooks/facility/useFacilitiesData';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

export const FacilityDetailsPanel = ({
  facility,
  removeUser,
  removeInstrument,
}: {
  facility: FacilityData;
  removeUser: (userId: number, facilityId: number) => void;
  removeInstrument: (instrumentId: number, facilityId: number) => void;
}) => {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const userRowActions = [
    {
      icon: () => <Delete />,
      tooltip: 'Remove User',
      onClick: (
        event: React.MouseEvent<HTMLElement>,
        rowData: BasicUserDetails | BasicUserDetails[]
      ) => {
        // It will always be a singleton not a array but the type checker needs the array
        const user = rowData as BasicUserDetails;

        api().removeUserFromFacility({
          userId: user.id,
          facilityId: facility.id,
        });
        removeUser(user.id, facility.id);
      },
    },
  ];

  const instrumentRowActions = [
    {
      icon: () => <Delete />,
      tooltip: 'Remove TODO',
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
        columns={[
          {
            title: 'Name',
            field: 'firstname',
          },
          {
            title: 'Surname',
            field: 'lastname',
          },
          {
            title: 'Institution',
            field: 'institution',
          },
        ]}
        data={facility.users}
        isLoading={isExecutingCall}
        title="Users"
        options={{
          selection: false,
        }}
        actions={userRowActions}
      />
    </>
  );
};
