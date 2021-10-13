import { GenericTemplateBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const genericTemplateBasisDefinition: Question = {
  dataType: DataType.GENERIC_TEMPLATE_BASIS,
  createBlankConfig: (): GenericTemplateBasisConfig => {
    const config = new GenericTemplateBasisConfig();
    config.titlePlaceholder = 'Title';
    config.questionLabel = '';

    return config;
  },
  getDefaultAnswer: () => null,
};
