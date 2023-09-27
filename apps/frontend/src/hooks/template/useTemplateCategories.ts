import { useEffect, useState } from 'react';

import { GetTemplateCategoriesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useTemplateCategories(isArchived = false) {
  const api = useDataApi();
  const [categories, setCategories] = useState<
    NonNullable<GetTemplateCategoriesQuery['templateCategories']>
  >([]);
  useEffect(() => {
    api()
      .getTemplateCategories()
      .then((data) => {
        if (data.templateCategories) {
          setCategories(data.templateCategories);
        }
      });
  }, [api, isArchived]);

  return { categories, setCategories };
}
