import React from 'react';
import { useQueryParams } from 'use-query-params';

import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { Institution } from 'generated/sdk';
import { useInstitutionsData } from 'hooks/admin/useInstitutionData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CreateUpdateInstitution from './CreateUpdateInstitution';

const InstitutionPage: React.FC = () => {
  const { api } = useDataApiWithFeedback();

  const {
    loadingInstitutions,
    institutions,
    setInstitutionsWithLoading: setInstitutions,
  } = useInstitutionsData();
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType
  >(DefaultQueryParams);

  const deleteInstitution = async (id: number | string) => {
    return await api('Institution removed successfully!')
      .deleteInstitution({
        id: id as number,
      })
      .then(resp => {
        if (resp.deleteInstitution.error) {
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
        urlQueryParams={urlQueryParams}
        setUrlQueryParams={setUrlQueryParams}
      />
    </div>
  );
};

export default InstitutionPage;
