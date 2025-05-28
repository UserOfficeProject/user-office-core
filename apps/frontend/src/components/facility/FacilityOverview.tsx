import MaterialTable from '@material-table/core';
import React from 'react';

import { useMyFacilitiesData } from 'hooks/facility/useMyFacilitiesData';

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

export const FacilityOverview = () => {
  const { facilities, loadingFacilities } = useMyFacilitiesData();

  return (
    <div data-cy="facility-table">
      <MaterialTable
        columns={facilitiesColumns}
        title={'Facilities'}
        data={facilities}
        options={{
          search: false,
          paging: false,
          headerStyle: { backgroundColor: '#fafafa' },
        }}
        isLoading={loadingFacilities}
        detailPanel={(rowData) => {
          return (
            <MaterialTable
              columns={[
                { title: 'Name', field: 'name' },
                { title: 'Description', field: 'description' },
              ]}
              data={rowData.rowData.instruments}
              title="Instruments"
              options={{
                selection: false,
              }}
            />
          );
        }}
      />
    </div>
  );
};
