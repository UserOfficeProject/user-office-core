import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import { useCallback, useEffect, useState } from 'react';

import { ProposalsFilter, ProposalView } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

type QueryParameters = {
  first?: number;
  offset?: number;
  sortField?: string | undefined;
  sortDirection?: string | undefined;
  searchText?: string | undefined;
};

export function useFacilityProposalsDataCore(
  filter: ProposalsFilter,
  queryParameters?: QueryParameters
) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalViewData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const {
    reviewer,
    callId,
    instrumentFilter,
    proposalStatusId,
    excludeProposalStatusIds,
    questionaryIds,
    text,
    questionFilter,
    referenceNumbers,
  } = filter;

  const fetchProposalsData = useCallback(
    async (componentController?: { unmounted: boolean }) => {
      setLoading(true);

      api()
        .getProposalsByUserFacility({
          filter: {
            reviewer,
            callId,
            instrumentFilter,
            proposalStatusId,
            excludeProposalStatusIds,
            questionaryIds,
            referenceNumbers,
            questionFilter: questionFilter && {
              ...questionFilter,
              value:
                JSON.stringify({ value: questionFilter?.value }) ?? undefined,
            },
            text,
          },
          ...queryParameters,
        })
        .then((data) => {
          if (componentController?.unmounted) {
            return;
          }
          if (data.proposalsByUserFacility?.proposals) {
            setProposalsData(
              data.proposalsByUserFacility?.proposals.map((proposal) => {
                return {
                  ...proposal,
                  status: proposal.submitted ? 'Submitted' : 'Open',
                  finalStatus: getTranslation(
                    proposal.finalStatus as ResourceId
                  ),
                } as ProposalViewData;
              })
            );
            setTotalCount(data.proposalsByUserFacility.totalCount);
          }
          setLoading(false);
        });
    },
    [
      reviewer,
      callId,
      instrumentFilter,
      proposalStatusId,
      excludeProposalStatusIds,
      questionaryIds,
      text,
      questionFilter,
      api,
      referenceNumbers,
      queryParameters,
    ]
  );

  useEffect(() => {
    const componentController = { unmounted: false };
    fetchProposalsData(componentController);

    return () => {
      componentController.unmounted = true;
    };
  }, [fetchProposalsData]);

  return {
    loading,
    proposalsData,
    setProposalsData,
    totalCount,
    fetchProposalsData,
  };
}

export interface ProposalViewData extends ProposalView {
  status: string;
}
