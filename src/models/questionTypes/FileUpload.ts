/* eslint-disable quotes */
import { FileUploadConfig } from '../../resolvers/types/FieldConfig';
import { QuestionTemplateRelation } from '../../resolvers/types/QuestionTemplateRelation';
import { QuestionFilterCompareOperator } from '../Questionary';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const fileUploadDefinition: Question = {
  dataType: DataType.FILE_UPLOAD,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.FILE_UPLOAD) {
      throw new Error('DataType should be FILE_UPLOAD');
    }
    const config = field.config as FileUploadConfig;
    if (config.required && !value) {
      return false;
    }

    return true;
  },
  createBlankConfig: (): FileUploadConfig => {
    const config = new FileUploadConfig();
    config.small_label = '';
    config.required = false;
    config.tooltip = '';
    config.file_type = [];
    config.max_files = 0;

    return config;
  },
  getDefaultAnswer: () => [],
  filterQuery: (queryBuilder, filter) => {
    const value = JSON.parse(filter.value).value;
    switch (filter.compareOperator) {
      case QuestionFilterCompareOperator.EXISTS:
        if (value === true) {
          return queryBuilder.andWhereRaw(
            "jsonb_array_length((answers.answer->>'value')::jsonb) > 0"
          );
        } else {
          return queryBuilder.andWhereRaw(
            "jsonb_array_length((answers.answer->>'value')::jsonb) = 0"
          );
        }

      default:
        throw new Error(
          `Unsupported comparator for Boolean ${filter.compareOperator}`
        );
    }
  },
};
