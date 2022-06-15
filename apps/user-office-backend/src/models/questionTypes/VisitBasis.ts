import { VisitBasisConfig } from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const visitBasisDefinition: Question = {
  dataType: DataType.VISIT_BASIS,
  createBlankConfig: (): VisitBasisConfig => {
    return new VisitBasisConfig();
  },
  getDefaultAnswer: () => null,
};
