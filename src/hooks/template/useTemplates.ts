import { useEffect, useState } from 'react';

import { GetTemplatesQuery, TemplateCategoryId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

interface TemplatesFilter {
  isArchived?: boolean;
  category?: TemplateCategoryId;
  templateIds?: number[];
}
export function useTemplates(filter: TemplatesFilter) {
  const [templatesFilter, setTemplatesFilter] = useState(filter);
  const api = useDataApi();
  const [templates, setTemplates] = useState<GetTemplatesQuery['templates']>(
    null
  );
  useEffect(() => {
    api()
      .getTemplates({ filter: templatesFilter })
      .then((data) => {
        if (data.templates) {
          setTemplates(data.templates);
        }
      });
  }, [api, templatesFilter]);

  return { templates, setTemplates, setTemplatesFilter };
}
