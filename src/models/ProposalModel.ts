import { DataType } from '../generated/sdk';

export interface Answer {
  questionId: string;
  value: string;
  dataType: DataType;
}

export interface DataTypeSpec {
  readonly: boolean;
}
