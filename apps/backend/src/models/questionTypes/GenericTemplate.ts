import { SubTemplateConfig } from '../../resolvers/types/FieldConfig';
import { DataType, TemplateCategoryId } from '../Template';
import { Question } from './QuestionRegistry';

export const genericTemplateDefinition: Question<DataType.GENERIC_TEMPLATE> = {
  dataType: DataType.GENERIC_TEMPLATE,
  createBlankConfig: (): SubTemplateConfig => {
    const config = new SubTemplateConfig();
    config.addEntryButtonLabel = 'Add';
    config.copyButtonLabel = '';
    config.canCopy = false;
    config.isMultipleCopySelect = false;
    config.isCompleteOnCopy = false;
    config.templateCategory =
      TemplateCategoryId[TemplateCategoryId.GENERIC_TEMPLATE];
    config.templateId = null;
    config.small_label = '';
    config.required = false;

    return config;
  },
  getDefaultAnswer: () => [],
};
