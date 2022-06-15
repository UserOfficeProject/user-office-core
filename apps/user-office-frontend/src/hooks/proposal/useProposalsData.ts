import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { Proposal, ProposalsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsData(filter: ProposalsFilter) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);

  const {
    callId,
    instrumentId,
    proposalStatusId,
    questionaryIds,
    questionFilter,
    text,
  } = filter;

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    api()
      .getProposals({
        filter: {
          callId,
          instrumentId,
          proposalStatusId,
          questionaryIds,
          questionFilter,
          text,
        },
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.proposals) {
          setProposalsData(data.proposals.proposals as Proposal[]);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [
    callId,
    instrumentId,
    proposalStatusId,
    questionaryIds,
    questionFilter,
    text,
    api,
    currentRole,
  ]);

  return { loading, proposalsData, setProposalsData };
}
