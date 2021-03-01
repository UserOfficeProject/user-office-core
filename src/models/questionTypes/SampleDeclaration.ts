import { SubtemplateConfig } from '../../resolvers/types/FieldConfig';
import { DataType, TemplateCategoryId } from '../Template';
import { Question } from './QuestionRegistry';

export const sampleDeclarationDefinition: Question = {
  dataType: DataType.SAMPLE_DECLARATION,
  createBlankConfig: (): SubtemplateConfig => {
    const config = new SubtemplateConfig();
    config.addEntryButtonLabel = 'Add';
    config.templateCategory =
      TemplateCategoryId[TemplateCategoryId.SAMPLE_DECLARATION];
    config.templateId = null;
    config.small_label = '';
    config.required = false;

    return config;
  },
  isReadOnly: false,
  getDefaultAnswer: () => [],
};
