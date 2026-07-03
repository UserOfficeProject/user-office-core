import { useEffect, useState } from 'react';

import { useDataApi } from 'hooks/common/useDataApi';

export function useGetDynamicMultipleChoiceOptions(
  questionId: string,
  templateId?: number | null
) {
  const [options, setOptions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    let unmounted = false;

    setLoadingOptions(true);
    api()
      .getDynamicMultipleChoiceOptions({ questionId, templateId })
      .then(({ options }) => {
        if (unmounted) {
          return;
        }

        if (options) {
          setOptions(options);
        }

        setLoadingOptions(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, questionId, templateId]);

  return {
    options,
    loadingOptions,
  };
}
