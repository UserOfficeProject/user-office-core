import { useSnackbar } from 'notistack';
import { useCallback, useContext, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { Rejection } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

const isMutationResult = (result: Record<string, unknown>) => {
  return result.hasOwnProperty('rejection');
};

function useDataApiWithFeedback() {
  const dataApi = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [isExecutingCall, setIsExecutingCall] = useState(false);
  const { handleLogout } = useContext(UserContext);

  const api = useCallback(
    (successToastMessage?: string) =>
      new Proxy(dataApi(), {
        get(target, prop) {
          return async (args: unknown) => {
            setIsExecutingCall(true);

            // @ts-expect-error TODO: Resolve this when there is some time for better investigation in the types.
            const serverResponse = await target[prop](args);
            const result = serverResponse[prop];

            if (result && isMutationResult(result)) {
              if (result.rejection) {
                let { reason } = result.rejection as Rejection;
                if (reason === 'EXTERNAL_TOKEN_INVALID') {
                  handleLogout();
                  reason =
                    'Your session has expired, you will need to log in again through the external homepage';
                }
                enqueueSnackbar(reason, {
                  variant: 'error',
                  className: 'snackbar-error',
                  autoHideDuration: 10000,
                });
              } else {
                successToastMessage &&
                  enqueueSnackbar(successToastMessage, {
                    variant: 'success',
                    className: 'snackbar-success',
                    autoHideDuration: 10000,
                  });
              }
            }
            setIsExecutingCall(false);

            return serverResponse;
          };
        },
      }),
    [setIsExecutingCall, dataApi, enqueueSnackbar, handleLogout]
  );

  return { api, isExecutingCall };
}

export default useDataApiWithFeedback;
