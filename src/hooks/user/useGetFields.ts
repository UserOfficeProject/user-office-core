import { useEffect, useState } from 'react';

import { GetFieldsQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useGetFields() {
  const [fieldContent, setFieldContent] = useState<
    GetFieldsQuery['getFields'] | null
  >(null);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    api()
      .getFields()
      .then((data) => {
        if (unmounted) {
          return;
        }

        setFieldContent(data.getFields);
      });

    return () => {
      unmounted = true;
    };
  }, [api]);

  return fieldContent;
}
