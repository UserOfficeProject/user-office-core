import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

type TMutationResult = { error: string | null };

const isMutationResult = (result: any) => {
  try {
    if (result.hasOwnProperty('error')) {
      // if result contains 'error' property, it's a mutation
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

function useDataApiWithFeedback() {
  const { enqueueSnackbar } = useSnackbar();

  const dataApi = useDataApi();
  const [isExecutingCall, setIsExecutingCall] = useState(false);

  const api = useCallback(
    (successToastMessage?: string) =>
      new Proxy(dataApi(), {
        get(target, prop) {
          return async (args: any) => {
            setIsExecutingCall(true);

            // @ts-ignore-line
            const serverResponse = await target[prop](args);
            let result = serverResponse[prop];

            if (isMutationResult(result)) {
              result = result as TMutationResult;
              if (result.error) {
                enqueueSnackbar(result.error, {
                  variant: 'error',
                });
              } else {
                successToastMessage &&
                  enqueueSnackbar(successToastMessage, { variant: 'success' });
              }
            }
            setIsExecutingCall(false);

            return serverResponse;
          };
        },
      }),
    [setIsExecutingCall, dataApi, enqueueSnackbar]
  );

  return { api, isExecutingCall };
}

export default useDataApiWithFeedback;
