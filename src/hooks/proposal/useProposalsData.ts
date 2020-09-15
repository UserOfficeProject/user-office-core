import { useEffect, useState, useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import {
  ProposalsFilter,
  ProposalStatusEnum,
  Proposal,
  UserRole,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsData(filter: ProposalsFilter) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);

  const { callId, instrumentId, questionaryIds, templateIds, text } = filter;

  useEffect(() => {
    if (currentRole === UserRole.INSTRUMENT_SCIENTIST) {
      api()
        .getInstrumentScientistProposals({
          filter: { callId, instrumentId, questionaryIds, templateIds, text },
        })
        .then(data => {
          if (data.instrumentScientistProposals) {
            setProposalsData(
              data.instrumentScientistProposals.proposals.map(proposal => {
                return {
                  ...proposal,
                  status:
                    proposal.status === ProposalStatusEnum.DRAFT
                      ? 'Open'
                      : 'Submitted',
                } as ProposalData;
              })
            );
          }
          setLoading(false);
        });
    } else {
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
                    proposal.status === ProposalStatusEnum.DRAFT
                      ? 'Open'
                      : 'Submitted',
                } as ProposalData;
              })
            );
          }
          setLoading(false);
        });
    }
  }, [
    callId,
    instrumentId,
    questionaryIds,
    templateIds,
    text,
    api,
    currentRole,
  ]);

  return { loading, proposalsData, setProposalsData };
}

export interface ProposalData extends Omit<Proposal, 'status' | 'questionary'> {
  status: string;
}
