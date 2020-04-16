import { SEP } from '../models/SEP';

export interface SEPDataSource {
  create(
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ): Promise<SEP>;
  update(
    id: number,
    code: string,
    description: string,
    numberRatingsRequired: number,
    active: boolean
  ): Promise<SEP>;
  get(id: number): Promise<SEP | null>;
  getAll(
    filter?: string,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; seps: SEP[] }>;
  assignMembers(memberIds: number[], sepId: number): Promise<boolean>;
}
