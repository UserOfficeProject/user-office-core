import { SampleEsiBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const sampleEsiBasisDefinition: Question = {
  dataType: DataType.SAMPLE_ESI_BASIS,
  createBlankConfig: (): SampleEsiBasisConfig => {
    const config = new SampleEsiBasisConfig();
    config.tooltip = '';

    return config;
  },
  getDefaultAnswer: () => null,
};
