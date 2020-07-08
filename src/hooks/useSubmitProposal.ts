import { useState } from 'react';

import { useDataApi } from 'hooks/useDataApi';

export function useSubmitProposal() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const api = useDataApi();

  const submitProposal = async (id: number) => {
    setIsLoading(true);

    return api()
      .submitProposal({ id })
      .then(data => {
        setIsLoading(false);

        return !data.submitProposal.error;
      });
  };

  return { isLoading, submitProposal };
}
