import { Typography } from '@mui/material';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { UserRole, PermissionsWithAccessToken } from 'generated/sdk';
import { useApiAccessTokensData } from 'hooks/admin/useApiAccessTokensData';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import CreateUpdateApiAccessToken from './CreateUpdateApiAccessToken';

const columns = [{ title: 'Name', field: 'name' }];

const ApiAccessTokensTable = () => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingApiAccessTokens,
    apiAccessTokens,
    setApiAccessTokensWithLoading: setApiAccessTokens,
  } = useApiAccessTokensData();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const createModal = (
    onUpdate: FunctionType<void, [PermissionsWithAccessToken | null]>,
    onCreate: (
      token: PermissionsWithAccessToken | null,
      shouldCloseAfterCreation?: boolean
    ) => void,
    editApiAccessToken: PermissionsWithAccessToken | null
  ) => (
    <CreateUpdateApiAccessToken
      apiAccessToken={editApiAccessToken}
      close={(apiAccessToken: PermissionsWithAccessToken | null) =>
        !!editApiAccessToken
          ? onUpdate(apiAccessToken)
          : onCreate(apiAccessToken, false)
      }
    />
  );

  const deleteApiAccessToken = async (id: string | number) => {
    try {
      await api({
        toastSuccessMessage: 'Api access token deleted successfully',
      }).deleteApiAccessToken({
        accessTokenId: id as string,
      });

      return true;
    } catch (error) {
      return false;
    }
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
        title={
          <Typography variant="h6" component="h2">
            API Access Tokens
          </Typography>
        }
        columns={columns}
        data={apiAccessTokens}
        isLoading={loadingApiAccessTokens}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        persistUrlQueryParams={true}
      />
    </div>
  );
};

export default ApiAccessTokensTable;
