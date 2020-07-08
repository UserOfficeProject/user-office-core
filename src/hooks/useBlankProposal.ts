import { useEffect, useState } from 'react';

import { GetBlankProposalQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/useDataApi';

export function useBlankProposal(callId: number) {
  const [proposal, setProposal] = useState<
    GetBlankProposalQuery['blankProposal']
  >();

  const api = useDataApi();

  useEffect(() => {
    api()
      .getBlankProposal({ callId })
      .then(data => {
        setProposal(data.blankProposal);
      });
  }, [api, callId]);

  return { proposal };
}
