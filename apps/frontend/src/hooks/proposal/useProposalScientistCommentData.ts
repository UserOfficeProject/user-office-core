import { useEffect, useState, useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { ProposalScientistComment } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
export function useProposalScientistCommentData(proposalPk: number) {
  const [scientistCommentData, setScientistCommentData] =
    useState<ProposalScientistComment | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    api()
      .getProposalScientistComment({
        proposalPk: proposalPk,
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.proposalScientistComment) {
          setScientistCommentData(data.proposalScientistComment);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, currentRole, proposalPk]);

  return { loading, scientistCommentData, setScientistCommentData };
}
