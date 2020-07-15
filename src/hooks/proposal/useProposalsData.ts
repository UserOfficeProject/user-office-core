import { useEffect, useState } from 'react';

import { ProposalsFilter, ProposalStatus, Proposal } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsData(filter: ProposalsFilter) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);

  const { callId, instrumentId, questionaryIds, templateIds, text } = filter;

  useEffect(() => {
    api()
      .getProposals({
        filter: { callId, instrumentId, questionaryIds, templateIds, text },
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
  }, [callId, instrumentId, questionaryIds, templateIds, text, api]);

  return { loading, proposalsData, setProposalsData };
}

export interface ProposalData extends Omit<Proposal, 'status' | 'questionary'> {
  status: string;
}
