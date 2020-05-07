import { useCallback, useState } from 'react';

import { useDataApi } from './useDataApi';

export function useCreateProposal(callId: number) {
  const [loading, setLoading] = useState(false);

  const api = useDataApi();

  const createProposal = useCallback(async () => {
    setLoading(true);

    return api()
      .createProposal({ callId })
      .then(data => {
        setLoading(false);

        return data.createProposal;
      });
  }, [api]);

  return { loading, createProposal };
}
