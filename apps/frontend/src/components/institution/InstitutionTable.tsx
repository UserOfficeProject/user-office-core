import { Typography } from '@mui/material';
import { Link } from '@mui/material';
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

import UpdateInstitution from './UpdateInstitution';

const columns = [
  { title: 'Name', field: 'name' },
  { title: 'Country', field: 'country.value' },
  {
    title: 'ROR ID',
    field: 'rorId',
    render: (rowData: Institution) => {
      return rowData.rorId ? (
        <Link href={rowData.rorId} target="_blank" title={rowData.rorId}>
          {rowData.rorId}
        </Link>
      ) : (
        '-'
      );
    },
  },
];

const InstitutionPage = () => {
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
    try {
      await api({
        toastSuccessMessage: 'Institution removed successfully!',
      }).deleteInstitution({
        id: id as number,
      });

      return true;
    } catch (error) {
      return false;
    }
  };

  const createModal = (
    onUpdate: FunctionType<void, [Institution | null]>,
    onCreate: FunctionType<void, [Institution | null]>,
    editInstitution: Institution | null
  ) => (
    <UpdateInstitution
      institution={editInstitution}
      close={(institution: Institution | null) => onUpdate(institution)}
    />
  );

  return (
    <div data-cy="institutions-table">
      <SuperMaterialTable
        delete={deleteInstitution}
        setData={setInstitutions}
        createModal={createModal}
        hasAccess={{ create: false, update: true, remove: true }}
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
