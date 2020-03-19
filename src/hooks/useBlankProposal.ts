import { useEffect, useState } from 'react';

import { GetBlankProposalQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useBlankProposal() {
  const [proposal, setProposal] = useState<
    GetBlankProposalQuery['blankProposal']
  >();

  const api = useDataApi();

  useEffect(() => {
    api()
      .getBlankProposal()
      .then(data => {
        setProposal(data.blankProposal);
      });
  }, [api]);

  return { proposal };
}
