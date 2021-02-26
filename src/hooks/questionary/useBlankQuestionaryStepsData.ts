import { useEffect, useState } from 'react';

import { QuestionaryStep } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useBlankQuestionaryStepsData(templateId: number) {
  const [questionarySteps, setQuestionarySteps] = useState<
    QuestionaryStep[] | null
  >(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    api()
      .getBlankQuestionarySteps({ templateId })
      .then((data) => {
        setQuestionarySteps(data.blankQuestionarySteps);
        setLoading(false);
      });
  }, [templateId, api]);

  return { loading, questionarySteps };
}
