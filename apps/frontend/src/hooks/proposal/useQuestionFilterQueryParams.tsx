import { useSearchParams } from 'react-router-dom';

import { QuestionFilterInput } from 'generated/sdk';

export const useQuestionFilterQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const questionId = searchParams.get('questionId');
  const compareOperator = searchParams.get('compareOperator');
  const value = searchParams.get('value');
  const dataType = searchParams.get('dataType');

  const query = {
    questionId: questionId || undefined,
    compareOperator: compareOperator || undefined,
    value: value || undefined,
    dataType: dataType || undefined,
  };

  const setQuestionFilterQuery = (filter?: QuestionFilterInput) => {
    setSearchParams((searchParams) => {
      if (filter?.questionId) searchParams.set('questionId', filter.questionId);
      if (filter?.compareOperator)
        searchParams.set('compareOperator', filter.compareOperator);
      if (filter?.value) searchParams.set('value', filter.value);
      if (filter?.dataType) searchParams.set('dataType', filter.dataType);

      return searchParams;
    });
  };

  return { questionFilterQuery: query, setQuestionFilterQuery };
};
