import { useEffect, useState } from 'react';

import { GetProposalTemplatesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useProposalsTemplates(
  isArchived?: boolean,
  templateIds?: number[] | null
) {
  const api = useDataApi();
  const [templates, setTemplates] = useState<
    Exclude<GetProposalTemplatesQuery['proposalTemplates'], null>
  >([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    setLoadingTemplates(true);
    api()
      .getProposalTemplates({ filter: { isArchived, templateIds } })
      .then((data) => {
        if (data.proposalTemplates) {
          setTemplates(data.proposalTemplates);
        }

        setLoadingTemplates(false);
      });
  }, [api, isArchived, templateIds]);

  return { templates, loadingTemplates, setTemplates };
}
