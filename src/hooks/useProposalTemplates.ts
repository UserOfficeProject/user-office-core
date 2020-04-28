import { useEffect, useState } from 'react';

import { GetProposalTemplatesQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useProposalsTemplates() {
  const api = useDataApi();
  const [templates, setTemplates] = useState<
    GetProposalTemplatesQuery['proposalTemplates']
  >([]);
  useEffect(() => {
    api()
      .getProposalTemplates()
      .then(data => {
        if (data.proposalTemplates) {
          setTemplates(data.proposalTemplates);
        }
      });
  }, [api]);

  return { templates, setTemplates };
}
