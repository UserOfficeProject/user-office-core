import { GetTemplateCategoriesQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useEffect, useState } from 'react';

export function useTemplateCategories(isArchived: boolean = false) {
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
  }, [api, isArchived]);

  return { categories, setCategories };
}
