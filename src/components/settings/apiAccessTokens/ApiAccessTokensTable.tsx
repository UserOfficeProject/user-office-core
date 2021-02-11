import React from 'react';
import { useQueryParams } from 'use-query-params';

import { useCheckAccess } from 'components/common/Can';
import SuperMaterialTable, {
  DefaultQueryParams,
  UrlQueryParamsType,
} from 'components/common/SuperMaterialTable';
import { UserRole, PermissionsWithAccessToken } from 'generated/sdk';
import { useApiAccessTokensData } from 'hooks/admin/useApiAccessTokensData';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import CreateUpdateApiAccessToken from './CreateUpdateApiAccessToken';

const ApiAccessTokensTable: React.FC = () => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingApiAccessTokens,
    apiAccessTokens,
    setApiAccessTokensWithLoading: setApiAccessTokens,
  } = useApiAccessTokensData();
  const [urlQueryParams, setUrlQueryParams] = useQueryParams<
    UrlQueryParamsType
  >(DefaultQueryParams);
  const columns = [{ title: 'Name', field: 'name' }];
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const createModal = (
    onUpdate: Function,
    onCreate: Function,
    editApiAccessToken: PermissionsWithAccessToken | null
  ) => (
    <CreateUpdateApiAccessToken
      apiAccessToken={editApiAccessToken}
      close={(apiAccessToken: PermissionsWithAccessToken | null) =>
        !!editApiAccessToken
          ? onUpdate(apiAccessToken)
          : onCreate(apiAccessToken)
      }
    />
  );

  const deleteApiAccessToken = async (id: string | number) => {
    return await api('Api access token deleted successfully')
      .deleteApiAccessToken({
        accessTokenId: id as string,
      })
      .then(resp => {
        if (resp.deleteApiAccessToken.error) {
          return false;
        } else {
          return true;
        }
      });
  };

  return (
    <div data-cy="api-access-tokens-table">
      <SuperMaterialTable
        delete={deleteApiAccessToken}
        createModal={createModal}
        createModalSize="lg"
        hasAccess={{
          update: isUserOfficer,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setApiAccessTokens}
        icons={tableIcons}
        title={'API Access Tokens'}
        columns={columns}
        data={apiAccessTokens}
        isLoading={loadingApiAccessTokens}
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

export default ApiAccessTokensTable;
