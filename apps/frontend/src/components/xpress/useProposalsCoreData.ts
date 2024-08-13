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

export function useProposalsCoreData(
  filter: ProposalsFilter,
  queryParameters?: QueryParameters
) {
  const api = useDataApi();
  const [proposalsData, setProposalsData] = useState<ProposalViewData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const { callId, techniqueFilter, proposalStatusId, text, referenceNumbers } =
    filter;

  const fetchProposalsData = useCallback(
    async (componentController?: { unmounted: boolean }) => {
      setLoading(true);

      api()
        .getTechniqueScientistProposals({
          filter: {
            callId,
            techniqueFilter,
            proposalStatusId,
            text,
            referenceNumbers,
          },
          ...queryParameters,
        })
        .then((data) => {
          if (componentController?.unmounted) {
            return;
          }
          if (data.techniqueScientistProposals) {
            setProposalsData(
              data.techniqueScientistProposals.proposals.map((proposal) => {
                return {
                  ...proposal,
                  status: proposal.submitted ? 'Submitted' : 'Open',
                  technicalReviews: proposal.technicalReviews?.map(
                    (technicalReview) => ({
                      ...technicalReview,
                      status: getTranslation(
                        technicalReview.status as ResourceId
                      ),
                    })
                  ),
                  finalStatus: getTranslation(
                    proposal.finalStatus as ResourceId
                  ),
                } as ProposalViewData;
              })
            );
            setTotalCount(data.techniqueScientistProposals.totalCount);
          }
          setLoading(false);
        });
    },
    [
      callId,
      techniqueFilter,
      proposalStatusId,
      text,
      referenceNumbers,
      api,
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
