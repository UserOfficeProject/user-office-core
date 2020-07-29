import { useEffect, useState } from 'react';

import { ProposalsFilter, ProposalView } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsCoreData(filter: ProposalsFilter) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalView[]>([]);
  const [loading, setLoading] = useState(true);

  const { callId, instrumentId, questionaryIds, templateIds, text } = filter;

  useEffect(() => {
    api()
      .getProposalsCore({
        filter: { callId, instrumentId, questionaryIds, templateIds, text },
      })
      .then(data => {
        if (data.proposalsView) {
          setProposalsData(data.proposalsView);
        }
        setLoading(false);
      });
  }, [callId, instrumentId, questionaryIds, templateIds, text, api]);

  return { loading, proposalsData, setProposalsData };
}
