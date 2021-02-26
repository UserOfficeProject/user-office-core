import { useEffect, useState } from 'react';

import { GetQuestionaryQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useQuestionary(questionaryId: number) {
  const [loadingQuestionary, setLoadingQuestionary] = useState<boolean>(true);
  const [questionary, setQuestionary] = useState<
    GetQuestionaryQuery['questionary']
  >(null);

  const api = useDataApi();

  useEffect(() => {
    setLoadingQuestionary(true);
    api()
      .getQuestionary({ questionaryId })
      .then((data) => {
        if (data.questionary) {
          setQuestionary(data.questionary);
        }
        setLoadingQuestionary(false);
      });
  }, [api, questionaryId]);

  return { questionary, loadingQuestionary };
}
