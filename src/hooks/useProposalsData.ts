import { useEffect, useState } from 'react';

import { ProposalStatus } from '../generated/sdk';
import { Proposal } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useProposalsData(filter: string) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api()
      .getProposals({
        filter: { text: filter },
      })
      .then(data => {
        if (data.proposals) {
          setProposalsData(
            data.proposals.proposals.map(proposal => {
              return {
                ...proposal,
                status:
                  proposal.status === ProposalStatus.DRAFT
                    ? 'Open'
                    : 'Submitted',
              } as ProposalData;
            })
          );
        }
        setLoading(false);
      });
  }, [filter, api]);

  return { loading, proposalsData, setProposalsData };
}

export interface ProposalData extends Omit<Proposal, 'status' | 'questionary'> {
  status: string;
}
