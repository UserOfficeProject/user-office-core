import { DataType, TemplateCategoryId } from '../Template';
import { SampleDeclarationConfig } from './../../resolvers/types/FieldConfig';
import { Question } from './QuestionRegistry';

export const sampleDeclarationDefinition: Question = {
  dataType: DataType.SAMPLE_DECLARATION,
  createBlankConfig: (): SampleDeclarationConfig => {
    const config = new SampleDeclarationConfig();
    config.addEntryButtonLabel = 'Add';
    config.templateCategory =
      TemplateCategoryId[TemplateCategoryId.SAMPLE_DECLARATION];
    config.templateId = null;
    config.esiTemplateId = null;
    config.small_label = '';
    config.required = false;

    return config;
  },
  getDefaultAnswer: () => [],
};
