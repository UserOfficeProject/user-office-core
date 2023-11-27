import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import { useCallback, useContext, useEffect, useState } from 'react';

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

  const fetchProposalsData = useCallback(
    async (componentController?: { unmounted: boolean }) => {
      setLoading(true);

      // NOTE: Internal reviewer has similar view as instrument scientist and it needs to get the proposals where the one is assigned as reviewer.
      if (
        currentRole === UserRole.INSTRUMENT_SCIENTIST ||
        currentRole === UserRole.INTERNAL_REVIEWER
      ) {
        api()
          .getInstrumentScientistProposalsBatched({
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
            ...queryParameters,
          })
          .then((data) => {
            if (componentController?.unmounted) {
              return;
            }
            if (data.instrumentScientistProposalsBatched) {
              setProposalsData(
                data.instrumentScientistProposalsBatched.proposals.map(
                  (proposal) => {
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
                  }
                )
              );
              setTotalCount(
                data.instrumentScientistProposalsBatched.totalCount
              );
            }
            setLoading(false);
          });
      } else {
        api()
          .getProposalsCoreBatched({
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
            if (componentController?.unmounted) {
              return;
            }
            if (data.proposalsViewBatched) {
              setProposalsData(
                data.proposalsViewBatched.proposalViews.map((proposal) => {
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
              setTotalCount(data.proposalsViewBatched.totalCount);
            }
            setLoading(false);
          });
      }
    },
    [
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

export interface ProposalViewData
  extends Omit<ProposalView, 'technicalStatus'> {
  status: string;
  technicalStatus: string;
}
