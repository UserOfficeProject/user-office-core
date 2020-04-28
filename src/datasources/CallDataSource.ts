import { Call } from '../models/Call';
import { CreateCallArgs } from '../resolvers/mutations/CreateCallMutation';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

export interface CallDataSource {
  // Read
  get(id: number): Promise<Call | null>;
  getCalls(filter?: CallsFilter): Promise<Call[]>;
  // Write
  create(args: CreateCallArgs): Promise<Call>;
}
