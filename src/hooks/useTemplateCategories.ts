import { useEffect, useState } from 'react';

import { GetTemplateCategoriesQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useTemplateCategories() {
  const api = useDataApi();
  const [categories, setCategories] = useState<
    Exclude<GetTemplateCategoriesQuery['templateCategories'], null>
  >([]);
  useEffect(() => {
    api()
      .getTemplateCategories()
      .then(data => {
        if (data.templateCategories) {
          setCategories(data.templateCategories);
        }
      });
  }, [api]);

  return { categories, setCategories };
}
