import { Typography } from '@mui/material';
import React from 'react';

import SuperMaterialTable from 'components/common/SuperMaterialTable';
import { OAuthClient, UserRole } from 'generated/sdk';
import { useOAuthClientsData } from 'hooks/admin/useOAuthClientsData';
import { useCheckAccess } from 'hooks/common/useCheckAccess';
import { tableIcons } from 'utils/materialIcons';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';

import CreateUpdateOAuthClient from './CreateUpdateOAuthClient';

const columns = [
  { title: 'Name', field: 'name' },
  { title: 'Client ID', field: 'clientId' },
  { title: 'Description', field: 'description' },
];

const OAuthClientsTable = () => {
  const { api } = useDataApiWithFeedback();
  const {
    loadingOAuthClients,
    oauthClients,
    setOAuthClientsWithLoading: setOAuthClients,
  } = useOAuthClientsData();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const createModal = (
    onUpdate: FunctionType<void, [OAuthClient | null]>,
    onCreate: FunctionType<void, [OAuthClient | null]>,
    editOAuthClient: OAuthClient | null
  ) => (
    <CreateUpdateOAuthClient
      oauthClient={editOAuthClient}
      close={(oauthClient: OAuthClient | null) =>
        !!editOAuthClient ? onUpdate(oauthClient) : onCreate(oauthClient)
      }
    />
  );

  const deleteOAuthClient = async (id: string | number) => {
    try {
      await api({
        toastSuccessMessage: 'OAuth client deleted successfully',
      }).deleteOAuthClient({
        clientId: id as string,
      });

      return true;
    } catch {
      return false;
    }
  };

  return (
    <div data-cy="oauth-clients-table">
      <SuperMaterialTable
        delete={deleteOAuthClient}
        createModal={createModal}
        createModalSize="lg"
        hasAccess={{
          update: isUserOfficer,
          create: isUserOfficer,
          remove: isUserOfficer,
        }}
        setData={setOAuthClients}
        icons={tableIcons}
        title={
          <Typography variant="h6" component="h2">
            OAuth Clients
          </Typography>
        }
        columns={columns}
        data={oauthClients}
        isLoading={loadingOAuthClients}
        options={{
          search: true,
          debounceInterval: 400,
        }}
        persistUrlQueryParams={true}
      />
    </div>
  );
};

export default OAuthClientsTable;
