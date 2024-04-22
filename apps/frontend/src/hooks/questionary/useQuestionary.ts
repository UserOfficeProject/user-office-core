import { useEffect, useState } from 'react';

import { GetQuestionaryQuery, Questionary } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useQuestionary(
  questionaryId: number,
  questionaryData?: Questionary
) {
  const [loadingQuestionary, setLoadingQuestionary] =
    useState<boolean>(!questionaryData);
  const [questionary, setQuestionary] = useState<
    GetQuestionaryQuery['questionary']
  >(questionaryData ?? null);

  const api = useDataApi();

  useEffect(() => {
    // If questionaryData is provided, we don't need to fetch it
    if (questionaryData) return;

    let unmounted = false;

    setLoadingQuestionary(true);
    api()
      .getQuestionary({ questionaryId })
      .then((data) => {
        if (unmounted) {
          return;
        }

        if (data.questionary) {
          setQuestionary(data.questionary);
        }
        setLoadingQuestionary(false);
      });

    return () => {
      unmounted = true;
    };
  }, [api, questionaryId, questionaryData]);

  return { questionary, loadingQuestionary };
}
