import { useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

export function useSubmitProposal() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const api = useDataApi();

  const submitProposal = async (proposalPk: number) => {
    setIsLoading(true);

    return api()
      .submitProposal({ proposalPk })
      .then((data) => {
        setIsLoading(false);

        return !data.submitProposal.rejection;
      });
  };

  return { isLoading, submitProposal };
}
