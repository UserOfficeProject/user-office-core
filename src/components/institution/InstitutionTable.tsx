import { Typography } from '@mui/material';
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
import { FunctionType } from 'utils/utilTypes';

import CreateUpdateInstitution from './CreateUpdateInstitution';

const InstitutionPage: React.FC = () => {
  const { api } = useDataApiWithFeedback();

  const {
    loadingInstitutions,
    institutions,
    setInstitutionsWithLoading: setInstitutions,
  } = useInstitutionsData({
    country: true,
  });
  const [urlQueryParams, setUrlQueryParams] =
    useQueryParams<UrlQueryParamsType>(DefaultQueryParams);

  const deleteInstitution = async (id: number | string) => {
    return await api({
      toastSuccessMessage: 'Institution removed successfully!',
    })
      .deleteInstitution({
        id: id as number,
      })
      .then((resp) => {
        if (resp.deleteInstitution.rejection) {
          return false;
        } else {
          return true;
        }
      });
  };

  const columns = [
    { title: 'Name', field: 'name' },
    { title: 'Country', field: 'country.value' },
    {
      title: 'Verified',
      field: 'verified',
      lookup: { true: 'Yes', false: 'No' },
    },
  ];

  const createModal = (
    onUpdate: FunctionType<void, [Institution | null]>,
    onCreate: FunctionType<void, [Institution | null]>,
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
        title={
          <Typography variant="h6" component="h2">
            Institutions
          </Typography>
        }
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
