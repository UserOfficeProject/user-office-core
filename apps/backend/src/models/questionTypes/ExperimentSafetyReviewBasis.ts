import { ExperimentSafetyReviewBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const experimentSafetyReviewBasisDefinition: Question<DataType.EXPERIMENT_SAFETY_REVIEW_BASIS> =
  {
    dataType: DataType.EXPERIMENT_SAFETY_REVIEW_BASIS,
    createBlankConfig: (): ExperimentSafetyReviewBasisConfig => {
      return new ExperimentSafetyReviewBasisConfig();
    },
    getDefaultAnswer: () => null,
  };
