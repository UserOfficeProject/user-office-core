import { useEffect, useState } from 'react';
import { ProposalTemplateMetadata } from './../generated/sdk';
import { useDataApi } from './useDataApi';

export function useProposalsTemplates() {
  const api = useDataApi();
  const [templates, setTemplates] = useState<ProposalTemplateMetadata[]>([]);
  useEffect(() => {
    api()
      .getProposalTemplatesMetadata()
      .then(data => {
        if (data.proposalTemplatesMetadata) {
          setTemplates(data.proposalTemplatesMetadata);
        }
      });
  }, [api]);

  return { templates, setTemplates };
}
