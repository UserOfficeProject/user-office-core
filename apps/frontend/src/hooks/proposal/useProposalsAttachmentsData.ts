import { useEffect, useState } from 'react';

import {
  GetProposalsWithAttachmentsQuery,
  ProposalsFilter,
} from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export type ProposalsAttachmentsData = NonNullable<
  GetProposalsWithAttachmentsQuery['proposals']
>;

export function useProposalsAttachmentsData(filter: ProposalsFilter) {
  const [proposalsAttachmentsData, setProposalsAttachmentsData] = useState<
    ProposalsAttachmentsData['proposals']
  >([]);
  const [loading, setLoading] = useState(true);

  const { referenceNumbers } = filter;

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getProposalsWithAttachments({
        filter: {
          referenceNumbers,
        },
      })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.proposals) {
          setProposalsAttachmentsData(data.proposals.proposals);
        }
        setLoading(false);
      });

    return () => {
      unmounted = true;
    };
  }, [referenceNumbers, api]);

  return { loading, proposalsAttachmentsData, setProposalsAttachmentsData };
}
