import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

import { GenericTemplateFragment } from '../../generated/sdk';

export function useGenericTemplate(genericTemplateId: number) {
  const [genericTemplate, setGenericTemplate] = useState<Pick<
    GenericTemplateFragment,
    'title' | 'questionaryId'
  > | null>(null);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getGenericTemplateMinimal({ genericTemplateId })
      .then((data) => {
        if (data.genericTemplate) {
          setGenericTemplate(data.genericTemplate);
        }
      });
  }, [api, genericTemplateId]);

  return { genericTemplate };
}
