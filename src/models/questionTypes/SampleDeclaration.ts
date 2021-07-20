import { SubTemplateConfig } from '../../resolvers/types/FieldConfig';
import { DataType, TemplateCategoryId } from '../Template';
import { Question } from './QuestionRegistry';

export const sampleDeclarationDefinition: Question = {
  dataType: DataType.SAMPLE_DECLARATION,
  createBlankConfig: (): SubTemplateConfig => {
    const config = new SubTemplateConfig();
    config.addEntryButtonLabel = 'Add';
    config.templateCategory =
      TemplateCategoryId[TemplateCategoryId.SAMPLE_DECLARATION];
    config.templateId = null;
    config.small_label = '';
    config.required = false;

    return config;
  },
  getDefaultAnswer: () => [],
};
