import { useEffect, useState } from 'react';

import { GenericTemplatesFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { GenericTemplateCore } from 'models/questionary/genericTemplate/GenericTemplateCore';

export function useGenericTemplates(filter?: GenericTemplatesFilter) {
  const [genericTemplates, setGenericTemplates] = useState<GenericTemplateCore[]>([]);

  const [genericTemplatesFilter, setGenericTemplatesFilter] = useState(filter);
  const [loadingGenericTemplates, setLoadingGenericTemplates] = useState(false);
  const api = useDataApi();

  useEffect(() => {
    setLoadingGenericTemplates(true);
    api()
      .getGenericTemplatesWithQuestionaryStatus({ filter: genericTemplatesFilter })
      .then((data) => {
        if (data.genericTemplates) {
          setGenericTemplates(data.genericTemplates);
        }
        setLoadingGenericTemplates(false);
      });
  }, [api, genericTemplatesFilter]);

  return { genericTemplates, loadingGenericTemplates, setGenericTemplates, setGenericTemplatesFilter };
}
