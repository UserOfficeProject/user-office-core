import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

const isMutationResult = (result: object) => {
  return result.hasOwnProperty('error');
};

function useDataApiWithFeedback() {
  const dataApi = useDataApi();
  const { enqueueSnackbar } = useSnackbar();
  const [isExecutingCall, setIsExecutingCall] = useState(false);

  const api = useCallback(
    (successToastMessage?: string) =>
      new Proxy(dataApi(), {
        get(target, prop) {
          return async (args: any) => {
            setIsExecutingCall(true);

            // @ts-ignore-line
            const serverResponse = await target[prop](args);
            const result = serverResponse[prop];

            if (result && isMutationResult(result)) {
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
