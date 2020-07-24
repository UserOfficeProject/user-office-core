import { useSnackbar } from 'notistack';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { Institution } from 'generated/sdk';
import { useInstitutionData } from 'hooks/admin/useInstitutionData';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';

import CreateUpdateInstitution from './CreateUpdateInstitution';

const InstitutionPage: React.FC = () => {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const { institutionData, setInstitutionData } = useInstitutionData();

  const deleteInstitution = async (id: number) => {
    return await api()
      .deleteInstitution({
        id: id,
      })
      .then(resp => {
        if (resp.deleteInstitution.error) {
          enqueueSnackbar('Failed to delete', {
            variant: 'error',
          });

          return false;
        } else {
          return true;
        }
      });
  };

  const columns = [
    { title: 'Name', field: 'name' },
    {
      title: 'Verified',
      field: 'verified',
      lookup: { true: 'true', false: 'false' },
    },
  ];

  const createModal = (
    onUpdate: Function,
    onCreate: Function,
    editInstitution: Institution | null
  ) => (
    <CreateUpdateInstitution
      institution={editInstitution}
      close={(institution: Institution | null) =>
        !!editInstitution ? onUpdate(institution) : onCreate(institution)
      }
    />
  );

  if (!institutionData) {
    return <p>Loading</p>;
  }

  return (
    <>
      <SuperMaterialTable
        delete={deleteInstitution}
        setData={setInstitutionData}
        createModal={createModal}
        icons={tableIcons}
        title={'Institutions'}
        columns={columns}
        data={institutionData}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />
    </>
  );
};

export default InstitutionPage;
