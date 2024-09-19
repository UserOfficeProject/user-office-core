import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import { useCallback, useContext, useEffect, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { ProposalsFilter, ProposalView, UserRole } from 'generated/sdk';
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
  const { currentRole } = useContext(UserContext);

  const {
    callId,
    instrumentFilter,
    techniqueFilter,
    proposalStatusId,
    text,
    referenceNumbers,
    dateFilter,
    excludeProposalStatusIds,
  } = filter;

  const fetchProposalsData = useCallback(
    async (componentController?: { unmounted: boolean }) => {
      setLoading(true);

      if (
        currentRole === UserRole.INSTRUMENT_SCIENTIST ||
        currentRole === UserRole.INTERNAL_REVIEWER
      ) {
        api()
          .getTechniqueScientistProposals({
            filter: {
              callId,
              instrumentFilter,
              techniqueFilter,
              proposalStatusId,
              text,
              referenceNumbers,
              dateFilter,
              excludeProposalStatusIds,
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
      } else {
        api()
          .getTechniqueScientistProposals({
            filter: {
              callId,
              instrumentFilter,
              techniqueFilter,
              proposalStatusId,
              text,
              referenceNumbers,
              dateFilter,
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
      }
    },
    [
      currentRole,
      api,
      callId,
      instrumentFilter,
      techniqueFilter,
      proposalStatusId,
      text,
      referenceNumbers,
      dateFilter,
      excludeProposalStatusIds,
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
