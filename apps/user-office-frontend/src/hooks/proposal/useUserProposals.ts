import { useEffect, useState } from 'react';

import { Proposal, ProposalPublicStatus, UserRole } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useUserProposals(role = UserRole.USER) {
  const [proposals, setProposals] = useState<
    Pick<
      Proposal,
      | 'primaryKey'
      | 'proposalId'
      | 'title'
      | 'publicStatus'
      | 'statusId'
      | 'created'
      | 'finalStatus'
      | 'notified'
      | 'submitted'
    >[]
  >([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingProposals(true);

    if (role === UserRole.USER_OFFICER) {
      api()
        .getProposalsCore({
          filter: {},
        })
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.proposalsView) {
            setProposals(
              data.proposalsView.proposalViews.map((proposalView) => ({
                primaryKey: proposalView.primaryKey,
                proposalId: proposalView.proposalId,
                title: proposalView.title,
                notified: proposalView.notified,
                submitted: proposalView.submitted,
                finalStatus: proposalView.finalStatus,
                publicStatus: ProposalPublicStatus.UNKNOWN,
                statusId: proposalView.statusId,
                created: '',
              }))
            );

            setLoadingProposals(false);
          }
        });
    } else {
      api()
        .getUserProposals()
        .then((data) => {
          if (unmounted) {
            return;
          }

          if (data.me) {
            setProposals(data.me.proposals);
          }
          setLoadingProposals(false);
        });
    }

    return () => {
      unmounted = true;
    };
  }, [api, role]);

  return { loadingProposals, proposals, setProposals };
}
