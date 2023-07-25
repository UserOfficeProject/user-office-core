import { FeedbackBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const feedbackBasisDefinition: Question<DataType.FEEDBACK_BASIS> = {
  dataType: DataType.FEEDBACK_BASIS,
  createBlankConfig: (): FeedbackBasisConfig => {
    return new FeedbackBasisConfig();
  },
  getDefaultAnswer: () => null,
};
