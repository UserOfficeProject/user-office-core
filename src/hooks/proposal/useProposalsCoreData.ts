import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { ProposalsFilter, ProposalView, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsCoreData(filter: ProposalsFilter) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalViewData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);

  const {
    callId,
    instrumentId,
    proposalStatusId,
    questionaryIds,
    text,
    questionFilter,
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
        })
        .then((data) => {
          if (unmounted) {
            return;
          }
          if (data.instrumentScientistProposals) {
            setProposalsData(
              data.instrumentScientistProposals.proposals.map((proposal) => {
                return {
                  ...proposal,
                  status: proposal.submitted ? 'Submitted' : 'Open',
                  technicalStatus: getTranslation(
                    proposal.technicalStatus as ResourceId
                  ),
                  finalStatus: getTranslation(
                    proposal.finalStatus as ResourceId
                  ),
                } as ProposalViewData;
              })
            );
            setTotalCount(data.instrumentScientistProposals.totalCount);
          }
          setLoading(false);
        });
    } else {
      api()
        .getProposalsCore({
          filter: {
            callId,
            instrumentId,
            proposalStatusId,
            questionaryIds,
            questionFilter: questionFilter && {
              ...questionFilter,
              value:
                JSON.stringify({ value: questionFilter?.value }) ?? undefined,
            }, // We wrap the value in JSON formatted string, because GraphQL can not handle UnionType input
            text,
          },
        })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.proposalsView) {
            setProposalsData(
              data.proposalsView.map((proposal) => {
                return {
                  ...proposal,
                  status: proposal.submitted ? 'Submitted' : 'Open',
                  technicalStatus: getTranslation(
                    proposal.technicalStatus as ResourceId
                  ),
                  finalStatus: getTranslation(
                    proposal.finalStatus as ResourceId
                  ),
                } as ProposalViewData;
              })
            );
          }
          setLoading(false);

          return () => {
            unmounted = true;
          };
        });
    }
  }, [
    callId,
    instrumentId,
    proposalStatusId,
    questionaryIds,
    text,
    questionFilter,
    api,
    currentRole,
  ]);

  return { loading, proposalsData, setProposalsData, totalCount };
}

export interface ProposalViewData
  extends Omit<ProposalView, 'technicalStatus'> {
  status: string;
  technicalStatus: string;
}
