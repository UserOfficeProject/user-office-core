import { useCallback, useState } from 'react';

import { useDataApi } from './useDataApi';

export function useCreateProposal() {
  const [loading, setLoading] = useState(false);

  const api = useDataApi();

  const createProposal = useCallback(async () => {
    setLoading(true);

    return api()
      .createProposal()
      .then(data => {
        setLoading(false);

        return data.createProposal;
      });
  }, [api]);

  return { loading, createProposal };
}
