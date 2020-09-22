import { useEffect, useState, useContext } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { ProposalsFilter, Proposal, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsData(filter: ProposalsFilter) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<Proposal[]>([]);
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
              data.instrumentScientistProposals.proposals as Proposal[]
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
            setProposalsData(data.proposals.proposals as Proposal[]);
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
