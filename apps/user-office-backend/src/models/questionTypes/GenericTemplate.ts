import { SubTemplateConfig } from '../../resolvers/types/FieldConfig';
import { DataType, TemplateCategoryId } from '../Template';
import { Question } from './QuestionRegistry';

export const genericTemplateDefinition: Question = {
  dataType: DataType.GENERIC_TEMPLATE,
  createBlankConfig: (): SubTemplateConfig => {
    const config = new SubTemplateConfig();
    config.addEntryButtonLabel = 'Add';
    config.templateCategory =
      TemplateCategoryId[TemplateCategoryId.GENERIC_TEMPLATE];
    config.templateId = null;
    config.small_label = '';
    config.required = false;

    return config;
  },
  getDefaultAnswer: () => [],
};
