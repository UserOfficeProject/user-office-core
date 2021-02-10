import { StringParam, useQueryParams } from 'use-query-params';

export const useQuestionFilterQueryParams = () => {
  const [query, setQuery] = useQueryParams({
    questionId: StringParam,
    compareOperator: StringParam,
    value: StringParam,
    dataType: StringParam,
  });
  const setQuestionFilterQuery = (filter?: {
    questionId: string;
    compareOperator: string;
    value: string;
    dataType: string;
  }) => {
    setQuery({
      questionId: filter?.questionId,
      compareOperator: filter?.compareOperator,
      value: filter?.value,
      dataType: filter?.dataType,
    });
  };

  return { questionFilterQuery: query, setQuestionFilterQuery };
};
