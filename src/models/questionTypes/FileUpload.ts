/* eslint-disable @typescript-eslint/camelcase */
import { FileUploadConfig } from '../../resolvers/types/FieldConfig';
import { QuestionTemplateRelation } from '../../resolvers/types/QuestionTemplateRelation';
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
  isReadOnly: false,
  defaultAnswer: [],
};
