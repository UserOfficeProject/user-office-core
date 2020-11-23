/* eslint-disable @typescript-eslint/camelcase */
import { SampleBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType, QuestionTemplateRelation } from '../Template';
import { Question } from './QuestionRegistry';

export const sampleBasisDefinition: Question = {
  dataType: DataType.SAMPLE_BASIS,
  validate: (field: QuestionTemplateRelation, value: any) => {
    if (field.question.dataType !== DataType.SAMPLE_BASIS) {
      throw new Error('DataType should be SAMPLE_BASIS');
    }

    return true;
  },
  createBlankConfig: (): SampleBasisConfig => {
    const config = new SampleBasisConfig();
    config.titlePlaceholder = 'Title';

    return config;
  },
  isReadOnly: true,
  defaultAnswer: null,
};
