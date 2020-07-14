import { useEffect, useState } from 'react';

import { GetProposalTemplatesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsTemplates(isArchived?: boolean) {
  const api = useDataApi();
  const [templates, setTemplates] = useState<
    Exclude<GetProposalTemplatesQuery['proposalTemplates'], null>
  >([]);
  useEffect(() => {
    api()
      .getProposalTemplates({ filter: { isArchived } })
      .then(data => {
        if (data.proposalTemplates) {
          setTemplates(data.proposalTemplates);
        }
      });
  }, [api, isArchived]);

  return { templates, setTemplates };
}
