import Lock from '@mui/icons-material/Lock';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router';

import AnimatedEllipsis from 'components/AnimatedEllipsis';
import CenteredAlert from 'components/common/CenteredAlert';
import { getUnauthorizedApi } from 'hooks/common/useDataApi';

function isValidUrl(authRedirect: string | null): boolean {
  if (!authRedirect) {
    return false;
  }

  try {
    new URL(authRedirect);

    return true;
  } catch (err) {
    //  malformed URL probably
    console.error(err);

    return false;
  }
}

export default function SharedAuth() {
  const api = getUnauthorizedApi();
  const { enqueueSnackbar } = useSnackbar();
  const authRedirect = new URLSearchParams(location.search).get('authRedirect');
  const history = useHistory();

  if (!isValidUrl(authRedirect)) {
    {
      api.addClientLog({
        error: `Invalid authRedirect URL; authRedirect: ${authRedirect}`,
      });

      enqueueSnackbar('Invalid authRedirect URL', { variant: 'error' });

      history.push('/');

      return null;
    }
  }

  window.location.href = authRedirect as string;

  return (
    <CenteredAlert severity="info" icon={<Lock fontSize="medium" />}>
      <AnimatedEllipsis>Please wait...</AnimatedEllipsis>
    </CenteredAlert>
  );
}
