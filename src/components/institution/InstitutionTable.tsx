import { useSnackbar } from 'notistack';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { Institution } from 'generated/sdk';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';
import { useDataApi } from 'hooks/common/useDataApi';
import { tableIcons } from 'utils/materialIcons';

import CreateUpdateInstitution from './CreateUpdateInstitution';

const InstitutionPage: React.FC = () => {
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const {
    loadingInstitutions,
    institutions,
    setInstitutionsWithLoading: setInstitutions,
  } = useInstitutionsData();

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
          enqueueSnackbar('Institution removed!', {
            variant: 'success',
          });

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

  return (
    <div data-cy="institutions-table">
      <SuperMaterialTable
        delete={deleteInstitution}
        setData={setInstitutions}
        createModal={createModal}
        icons={tableIcons}
        title={'Institutions'}
        columns={columns}
        isLoading={loadingInstitutions}
        data={institutions}
        options={{
          search: true,
          debounceInterval: 400,
        }}
      />
    </div>
  );
};

export default InstitutionPage;
