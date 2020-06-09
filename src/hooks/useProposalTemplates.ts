import { useEffect, useState } from 'react';

import { GetTemplatesQuery } from '../generated/sdk';
import { useDataApi } from './useDataApi';

export function useProposalsTemplates() {
  const api = useDataApi();
  const [templates, setTemplates] = useState<
    Exclude<GetTemplatesQuery['templates'], null>
  >([]);
  useEffect(() => {
    api()
      .getTemplates()
      .then(data => {
        if (data.templates) {
          setTemplates(data.templates);
        }
      });
  }, [api]);

  return { templates, setTemplates };
}
