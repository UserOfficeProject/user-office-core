import { useEffect, useState } from 'react';

import { GetTemplatesQuery, TemplateCategoryId } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useTemplates(
  isArchived?: boolean,
  category?: TemplateCategoryId
) {
  const api = useDataApi();
  const [templates, setTemplates] = useState<
    Exclude<GetTemplatesQuery['templates'], null>
  >([]);
  useEffect(() => {
    api()
      .getTemplates({ filter: { isArchived, category } })
      .then(data => {
        if (data.templates) {
          setTemplates(data.templates);
        }
      });
  }, [api, isArchived, category]);

  return { templates, setTemplates };
}
