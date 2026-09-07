import { SnackbarAction, useSnackbar, VariantType } from 'notistack';
import { useCallback, useState } from 'react';

import { getSdk } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type KeyOfSdk = keyof ReturnType<typeof getSdk>;

function useDataApiWithFeedback() {
  const dataApi = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [isExecutingCall, setIsExecutingCall] = useState(false);

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
            try {
              const serverResponse = await target[prop as KeyOfSdk](args);
              props?.toastSuccessMessage &&
                enqueueSnackbar(props.toastSuccessMessage, {
                  variant: props.toastSuccessMessageVariant ?? 'success',
                  className: 'snackbar-success',
                  autoHideDuration: 10000,
                });

              return serverResponse;
            } finally {
              setIsExecutingCall(false);
            }
          };
        },
      }),
    [setIsExecutingCall, dataApi, enqueueSnackbar]
  );

  return { api, isExecutingCall };
}

export default useDataApiWithFeedback;
