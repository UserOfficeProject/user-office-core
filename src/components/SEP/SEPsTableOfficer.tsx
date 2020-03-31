import { Edit } from '@material-ui/icons';
import MaterialTable from 'material-table';
import React, { useState } from 'react';
import { Redirect } from 'react-router';

import { Sep } from '../../generated/sdk';
import { useSEPsData } from '../../hooks/useSEPsData';
import { tableIcons } from '../../utils/materialIcons';

const SEPsTableOfficer: React.FC = () => {
  const { loading, SEPsData } = useSEPsData('');
  const columns = [
    { title: 'SEP ID', field: 'id' },
    { title: 'Code', field: 'code' },
    { title: 'Description', field: 'description' },
    {
      title: 'Active',
      field: 'active',
      render: (rowData: Sep): string => (rowData.active ? 'Yes' : 'No'),
    },
  ];
  const [editSEPID, setEditSEPID] = useState(0);

  if (editSEPID) {
    return <Redirect push to={`/SEPPage/${editSEPID}`} />;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  const EditIcon = (): JSX.Element => <Edit />;

  return (
    <>
      <MaterialTable
        icons={tableIcons}
        title={'Scientific evaluation panels'}
        columns={columns}
        data={SEPsData}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        actions={[
          {
            icon: EditIcon,
            tooltip: 'Edit SEP',
            onClick: (event, rowData): void =>
              setEditSEPID((rowData as Sep).id),
            position: 'row',
          },
        ]}
      />
    </>
  );
};

export default SEPsTableOfficer;
