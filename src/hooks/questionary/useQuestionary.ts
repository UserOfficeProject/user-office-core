import { GetQuestionaryQuery } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';
import { useEffect, useState } from 'react';

export function useQuestionary(questionaryId: number) {
  const [questionary, setQuestionary] = useState<
    GetQuestionaryQuery['questionary']
  >(null);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getQuestionary({ questionaryId })
      .then(data => {
        if (data.questionary) {
          setQuestionary(data.questionary);
        }
      });
  }, [api, questionaryId]);

  return { questionary };
}
