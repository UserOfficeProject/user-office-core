import { nonCreatableQuestions } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionsFilter } from 'generated/sdk';

import { useQuestions } from './useQuestions';

const nonCreateableQuestionsDataTypes = nonCreatableQuestions.map(
  (definition) => definition.dataType
);

const modifyFilter = (filter: QuestionsFilter | undefined) => ({
  ...filter,
  excludeDataType: nonCreateableQuestionsDataTypes,
});

/**
 * This method will return all questions that are creatable
 * @param filter filter for questions
 * @returns Array of questions
 */
export function useCreatableQuestions(filter?: QuestionsFilter) {
  const useQuestionsReturnObj = useQuestions(modifyFilter(filter));

  return {
    ...useQuestionsReturnObj,
    setQuestionsFilter: (filter: QuestionsFilter | undefined) =>
      useQuestionsReturnObj.setQuestionsFilter(modifyFilter(filter)),
  };
}
