import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { GenericTemplateCore } from 'models/questionary/genericTemplate/GenericTemplateCore';

export function useProposalGenericTemplates(proposalPk: number | null) {
  const [genericTemplates, setGenericTemplates] = useState<GenericTemplateCore[]>([]);

  const [loadingGenericTemplates, setLoadingGenericTemplates] = useState(false);
  const api = useDataApi();

  useEffect(() => {
    if (!proposalPk) {
      setGenericTemplates([]);

      return;
    }
    setLoadingGenericTemplates(true);
    api()
      .getGenericTemplatesWithQuestionaryStatus({ filter: { proposalPk } })
      .then((data) => {
        if (data.genericTemplates) {
          setGenericTemplates(data.genericTemplates);
        }
        setLoadingGenericTemplates(false);
      });
  }, [api, proposalPk]);

  return { genericTemplates, loadingGenericTemplates, setGenericTemplates };
}
