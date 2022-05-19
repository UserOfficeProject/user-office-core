import { SnackbarAction, useSnackbar, VariantType } from 'notistack';
import { useCallback, useContext, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { Rejection, getSdk } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type KeyOfSdk = keyof ReturnType<typeof getSdk>;

const isMutationResult = (result: Record<string, unknown>) => {
  return result.hasOwnProperty('rejection');
};

function useDataApiWithFeedback() {
  const dataApi = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [isExecutingCall, setIsExecutingCall] = useState(false);
  const { handleLogout } = useContext(UserContext);

  const api = useCallback(
    (props?: {
      toastSuccessMessage?: string;
      toastErrorMessage?: string;
      toastSuccessMessageVariant?: VariantType;
      toastErrorMessageAction?: SnackbarAction;
    }) =>
      new Proxy(dataApi(), {
        get(target, prop) {
          return async (args: never) => {
            setIsExecutingCall(true);

            const serverResponse = await target[prop as KeyOfSdk](args);
            const result: { [prop: string]: unknown; rejection: unknown } =
              serverResponse[prop as keyof typeof serverResponse];

            if (result && isMutationResult(result)) {
              if (result.rejection) {
                let { reason } = result.rejection as Rejection;
                if (reason === 'EXTERNAL_TOKEN_INVALID') {
                  handleLogout();
                  reason =
                    'Your session has expired, you will need to log in again through the external homepage';
                }
                enqueueSnackbar(props?.toastErrorMessage ?? reason, {
                  variant: 'error',
                  className: 'snackbar-error',
                  autoHideDuration: 10000,
                  action: props?.toastErrorMessageAction,
                });
              } else {
                props?.toastSuccessMessage &&
                  enqueueSnackbar(props.toastSuccessMessage, {
                    variant: props.toastSuccessMessageVariant ?? 'success',
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
