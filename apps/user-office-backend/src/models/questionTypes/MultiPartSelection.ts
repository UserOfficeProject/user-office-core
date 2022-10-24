import { MultiPartSelectionConfig } from '../../resolvers/types/FieldConfig';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const multiPartSelectionDefinition: Question = {
  dataType: DataType.MULTI_PART_SELECTION,
  getDefaultAnswer: () => {
    return { partOneAnswer: '', partTwoAnswer: '' };
  },

  //TODO: Add validate implementation

  createBlankConfig: (): MultiPartSelectionConfig => {
    const config = new MultiPartSelectionConfig();
    config.small_label = '';
    config.required = false;
    config.selectionPairs = [];
    config.tooltip = '';
    config.partOneQuestion = '';
    config.partTwoQuestion = '';

    return config;
  },
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.INCLUDES:
        /*
                "\\?" is escaping question mark for JSONB lookup
              (read more here https://www.postgresql.org/docs/9.5/functions-json.html),
                but "?" is used for binding
                                    */
        //TODO: Search query not working
        return queryBuilder.andWhere((q) => {
          q.orWhereRaw(
            //eslint-disable-next-line quotes
            "(answers.answer -> 'value' ->> 'partOneAnswer')::jsonb \\? ?",
            value
          ).orWhereRaw(
            //eslint-disable-next-line quotes
            "(answers.answer -> 'value' ->> 'partTwoAnswer')::jsonb \\? ?",
            value
          );
        });

      default:
        throw new Error(
          `Unsupported comparator for SelectionFromOptions ${filter.compareOperator}`
        );
    }
  },
};
