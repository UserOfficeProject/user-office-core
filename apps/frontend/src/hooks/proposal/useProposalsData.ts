import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { Proposal, ProposalsFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export enum ProposalsDataQuantity {
  MINIMAL,
  FULL,
}

export function useProposalsData(
  filter: ProposalsFilter,
  dataQuantity: ProposalsDataQuantity
) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);

  const {
    callId,
    instrumentFilter,
    proposalStatusId,
    questionaryIds,
    questionFilter,
    templateIds,
    text,
    referenceNumbers,
  } = filter;

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    let getProposals;
    switch (dataQuantity) {
      case ProposalsDataQuantity.FULL:
        getProposals = api().getProposals;
        break;
      case ProposalsDataQuantity.MINIMAL:
        getProposals = api().getProposalsMinimal;
        break;
    }

    getProposals({
      filter: {
        callId,
        instrumentFilter,
        proposalStatusId,
        questionaryIds,
        questionFilter,
        templateIds,
        text,
        referenceNumbers,
      },
    }).then((data) => {
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
    instrumentFilter,
    proposalStatusId,
    questionaryIds,
    questionFilter,
    templateIds,
    text,
    api,
    currentRole,
    referenceNumbers,
    dataQuantity,
  ]);

  return { loading, proposalsData, setProposalsData };
}
