import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import { useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { ProposalsFilter, ProposalView, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import { QueryParameters } from '../../components/proposal/ProposalTableOfficer';

export function useProposalsCoreData(
  filter: ProposalsFilter,
  queryParameters?: QueryParameters
) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalViewData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { currentRole } = useContext(UserContext);
  const {
    reviewer,
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
            reviewer,
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
          ...queryParameters,
        })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.proposalsView) {
            setProposalsData(
              data.proposalsView.proposalViews.map((proposal) => {
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
            setTotalCount(data.proposalsView.totalCount);
          }
          setLoading(false);

          return () => {
            unmounted = true;
          };
        });
    }
  }, [
    reviewer,
    callId,
    instrumentId,
    proposalStatusId,
    questionaryIds,
    text,
    questionFilter,
    api,
    currentRole,
    queryParameters,
  ]);

  return { loading, proposalsData, setProposalsData, totalCount };
}

export interface ProposalViewData
  extends Omit<ProposalView, 'technicalStatus'> {
  status: string;
  technicalStatus: string;
}
