import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { Proposal, ProposalsFilter, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsData(
  filter: ProposalsFilter & { offset?: number; first?: number }
) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<Proposal[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);

  const {
    callId,
    instrumentId,
    proposalStatusId,
    questionaryIds,
    questionFilter,
    text,
    offset,
    first,
  } = filter;

  useEffect(() => {
    let unmounted = false;

    setLoading(true);

    if (currentRole === UserRole.INSTRUMENT_SCIENTIST) {
      api()
        .getInstrumentScientistProposals({
          filter: {
            callId,
            instrumentId,
            proposalStatusId,
            questionaryIds,
            questionFilter: questionFilter && {
              ...questionFilter,
              value:
                JSON.stringify({ value: questionFilter?.value }) ?? undefined,
            },
            text,
          },
          offset,
          first,
        })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.instrumentScientistProposals) {
            setProposalsData(
              data.instrumentScientistProposals.proposals as Proposal[]
            );
            setTotalCount(data.instrumentScientistProposals.totalCount);
          }
          setLoading(false);
        });
    } else {
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
    }

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
    offset,
    first,
  ]);

  return { loading, proposalsData, totalCount, setProposalsData };
}
