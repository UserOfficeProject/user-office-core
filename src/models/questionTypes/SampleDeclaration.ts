/* eslint-disable @typescript-eslint/camelcase */
import { SubtemplateConfig } from '../../resolvers/types/FieldConfig';
import {
  DataType,
  QuestionTemplateRelation,
  TemplateCategoryId,
} from '../Template';
import { Question } from './QuestionRegistry';

export const sampleDeclarationDefinition: Question = {
  dataType: DataType.SAMPLE_DECLARATION,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.SAMPLE_DECLARATION) {
      throw new Error('DataType should be SAMPLE_DECLARATION');
    }

    return true;
  },
  createBlankConfig: (): SubtemplateConfig => {
    const config = new SubtemplateConfig();
    config.addEntryButtonLabel = 'Add';
    config.maxEntries = 0;
    config.templateCategory =
      TemplateCategoryId[TemplateCategoryId.SAMPLE_DECLARATION];
    config.templateId = 0;
    config.small_label = '';
    config.required = false;

    return config;
  },
  isReadOnly: false,
  getDefaultAnswer: () => [],
};
