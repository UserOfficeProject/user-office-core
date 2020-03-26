import { SEP } from '../models/SEP';

export interface SEPDataSource {
  create(
    code: string,
    description: string,
    numberRatingsRequired: number | null,
    active: boolean
  ): Promise<SEP>;
  get(): Promise<SEP[] | null>;
}
