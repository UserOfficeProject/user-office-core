import { useSnackbar } from 'notistack';
import { useState } from 'react';

type TServiceCall<T> = Promise<T & { error: string | null }>;

function useCallWithFeedback() {
  const { enqueueSnackbar } = useSnackbar();
  const [isExecutingCall, setIsExecutingCall] = useState(false);
  const callWithFeedback = <T>(
    call: TServiceCall<T>,
    successToastMessage?: string
  ) => {
    setIsExecutingCall(true);
    return call.then(result => {
      if (result.error) {
        enqueueSnackbar(result.error, { variant: 'error' });
      } else {
        successToastMessage &&
          enqueueSnackbar(successToastMessage, { variant: 'success' });
      }
      setIsExecutingCall(false);
      return result;
    });
  };
  return { callWithFeedback, isExecutingCall };
}

export default useCallWithFeedback;
