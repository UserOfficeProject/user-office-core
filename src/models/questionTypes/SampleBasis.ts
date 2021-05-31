import { SampleBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const sampleBasisDefinition: Question = {
  dataType: DataType.SAMPLE_BASIS,
  createBlankConfig: (): SampleBasisConfig => {
    const config = new SampleBasisConfig();
    config.titlePlaceholder = 'Title';

    return config;
  },
  getDefaultAnswer: () => null,
};
