import {
  ConfigBase,
  ShipmentBasisConfig,
} from '../../resolvers/types/FieldConfig';
import { DataType } from '../Template';
import { Question } from './QuestionRegistry';

export const shipmentBasis: Question = {
  dataType: DataType.SHIPMENT_BASIS,
  createBlankConfig: (): ConfigBase => new ShipmentBasisConfig(),
  getDefaultAnswer: () => null,
};
