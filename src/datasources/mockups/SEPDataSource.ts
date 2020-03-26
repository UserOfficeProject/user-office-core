import { SEP } from '../../models/SEP';
import { SEPDataSource } from '../SEPDataSource';

export const dummySEP = new SEP(
  1,
  'SEP 1',
  'Scientific evaluation panel 1',
  2,
  true
);

export const dummySEPs = [dummySEP];

export class SEPDataSourceMock implements SEPDataSource {
  async create(
    code: string,
    description: string,
    numberRatingsRequired: number | null,
    active: boolean
  ) {
    return dummySEP;
  }

  async get() {
    return dummySEPs;
  }
}
