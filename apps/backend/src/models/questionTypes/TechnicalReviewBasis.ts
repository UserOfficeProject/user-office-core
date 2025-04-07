import { TechnicalReviewBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const technicalReviewBasisDefinition: Question<DataType.TECHNICAL_REVIEW_BASIS> =
  {
    dataType: DataType.TECHNICAL_REVIEW_BASIS,
    createBlankConfig: (): TechnicalReviewBasisConfig => {
      return new TechnicalReviewBasisConfig();
    },
    getDefaultAnswer: () => null,
  };
