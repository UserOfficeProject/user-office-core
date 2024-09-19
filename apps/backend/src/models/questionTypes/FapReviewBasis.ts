import { FapReviewBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const fapReviewBasisDefinition: Question<DataType.FAP_REVIEW_BASIS> = {
  dataType: DataType.FAP_REVIEW_BASIS,
  createBlankConfig: (): FapReviewBasisConfig => {
    return new FapReviewBasisConfig();
  },
  getDefaultAnswer: () => null,
};
