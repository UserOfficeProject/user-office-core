import { useEffect, useState } from 'react';

import { GenericTemplatesFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { GenericTemplateCoreWithProposalData } from 'models/questionary/genericTemplate/GenericTemplateCore';

export function useGenericTemplatesData(filter: GenericTemplatesFilter) {
  const api = useDataApi();
  const [genericTemplates, setGenericTemplates] = useState<
    GenericTemplateCoreWithProposalData[]
  >([]);
  const [loadingGenericTemplates, setLoadingGenericTemplates] = useState(true);

  const [genericTemplatesFilter, setGenericTemplatesFilter] = useState(filter);

  useEffect(() => {
    let unmounted = false;

    setLoadingGenericTemplates(true);
    api()
      .getGenericTemplatesWithProposalData({
        filter: genericTemplatesFilter,
      })
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.genericTemplates) {
          setGenericTemplates(data.genericTemplates);
        }
        setLoadingGenericTemplates(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, genericTemplatesFilter]);

  return {
    genericTemplates,
    loadingGenericTemplates,
    setGenericTemplates,
    setGenericTemplatesFilter,
  };
}
