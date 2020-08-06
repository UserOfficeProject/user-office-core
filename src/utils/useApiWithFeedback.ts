import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react';

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

function useApiWithFeedback() {
  const { enqueueSnackbar } = useSnackbar();
  const api = useDataApi();
  const [isExecutingCall, setIsExecutingCall] = useState(false);

  const apiWithFeeback = (
    config: { successToastMessage?: string; errorToastMessage?: string } = {}
  ) =>
    new Proxy(api(), {
      get(target, prop) {
        const { successToastMessage, errorToastMessage } = config;

        return async (args: any) => {
          setIsExecutingCall(true);

          // @ts-ignore-line
          const serverResponse = await target[prop](args);
          let result = serverResponse[prop];

          if (isMutationResult(result)) {
            result = result as TMutationResult;
            if (result.error) {
              enqueueSnackbar(errorToastMessage || result.error, {
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
    });

  return { api: useCallback(() => apiWithFeeback, [])(), isExecutingCall };
}

export default useApiWithFeedback;
