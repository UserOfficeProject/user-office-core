import MaterialTable from '@material-table/core';
import React from 'react';

import { FacilityData } from 'hooks/facility/useFacilitiesData';

export const FacilityDetailsPanel = ({
  facility,
}: {
  facility: FacilityData;
}) => {
  return (
    <>
      <MaterialTable
        columns={[
          { title: 'Name', field: 'name' },
          { title: 'Description', field: 'description' },
        ]}
        data={facility.instruments}
        title="Instruments"
        options={{
          selection: false,
        }}
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
        title="Users"
        options={{
          selection: false,
        }}
      />
    </>
  );
};
