import { FapReviewBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const fapReviewBasisDefinition: Question<DataType.FAP_REVIEW_BASIS> = {
  dataType: DataType.FAP_REVIEW_BASIS,
  createBlankConfig: (): FapReviewBasisConfig => {
    const config = new FapReviewBasisConfig();
    config.minGrade = 1;
    config.maxGrade = 10;
    config.decimalPoints = 0;
    config.nonNumericOptions = [];

    return config;
  },
  getDefaultAnswer: () => null,
};
