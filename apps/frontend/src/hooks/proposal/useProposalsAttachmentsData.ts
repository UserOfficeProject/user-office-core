import { useEffect, useState } from 'react';

import {
  GetProposalsAttachmentsQuery,
  Proposal,
  ProposalsFilter,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type ProposalsAttachmentsData = NonNullable<
  GetProposalsAttachmentsQuery['proposals']
>;

export function useProposalsAttachmentsData(filter: ProposalsFilter) {
  const [proposalsAttachmentsData, setProposalsAttachmentsData] = useState<
    Proposal[]
  >([]);
  const [loading, setLoading] = useState(true);

  const { referenceNumbers } = filter;

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getProposalsAttachments({
        filter: {
          referenceNumbers,
        },
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.proposals) {
          setProposalsAttachmentsData(data.proposals.proposals as Proposal[]);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [referenceNumbers, api]);

  return { loading, proposalsAttachmentsData, setProposalsAttachmentsData };
}
