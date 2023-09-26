import { useEffect, useState } from 'react';

import { GenericTemplatesFilter } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import { GenericTemplateCore } from '../../models/questionary/genericTemplate/GenericTemplateCore';

export function useGenericTemplatesWithQuestionaryStatus(
  filter?: GenericTemplatesFilter
) {
  const [genericTemplates, setGenericTemplates] = useState<
    GenericTemplateCore[]
  >([]);

  const [genericTemplatesFilter, setGenericTemplatesFilter] = useState(filter);
  const [loadingGenericTemplates, setLoadingGenericTemplates] = useState(false);
  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingGenericTemplates(true);
    api()
      .getGenericTemplatesWithQuestionaryStatus({
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
