import { useEffect, useState } from 'react';

import { QuestionaryStep } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

export function useBlankQuestionaryStepsDataByCallId(
  callId: number | undefined | null
) {
  const [questionarySteps, setQuestionarySteps] = useState<
    QuestionaryStep[] | null
  >(null);
  const [loading, setLoading] = useState(true);

  const api = useDataApi();

  useEffect(() => {
    if (!callId) {
      return;
    }
    api()
      .getBlankQuestionaryStepsByCallId({ callId })
      .then((data) => {
        setQuestionarySteps(data.blankQuestionaryStepsByCallId);
        setLoading(false);
      });
  }, [callId, api]);

  return { loading, questionarySteps };
}
