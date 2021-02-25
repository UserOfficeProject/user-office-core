import { useEffect, useState } from 'react';

import { GetFieldsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useGetFields() {
  const [fieldContent, setFieldContent] = useState<
    GetFieldsQuery['getFields'] | null
  >(null);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getFields()
      .then((data) => {
        setFieldContent(data.getFields);
      });
  }, [api]);

  return fieldContent;
}
