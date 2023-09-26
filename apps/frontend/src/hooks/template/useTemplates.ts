import { useEffect, useState } from 'react';

import { GetTemplatesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

import { TemplatesFilter } from './../../generated/sdk';

type Templates = GetTemplatesQuery['templates'];

/**
 * Obtains templates matching the filter criteria
 * @param filter Specify empty object to obtain all templates, or undefined to skip the lookup
 * @returns
 */
export function useTemplates(filter?: TemplatesFilter) {
  const api = useDataApi();

  const [templates, setTemplates] = useState<Templates>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templatesFilter, setTemplatesFilter] = useState(filter);

  if (filter && !templatesFilter) {
    setTemplatesFilter(filter);
  }

  useEffect(() => {
    let unmounted = false;
    if (templatesFilter === undefined) {
      return;
    }
    api()
      .getTemplates({ filter: templatesFilter })
      .then((data) => {
        if (unmounted) {
          return;
        }
        if (data.templates) {
          setTemplates(data.templates);
        }
        setLoadingTemplates(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, templatesFilter]);

  return { templates, setTemplates, setTemplatesFilter, loadingTemplates };
}
