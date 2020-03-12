import { Call } from '../models/Call';
import { CreateCallArgs } from '../resolvers/mutations/CreateCallMutation';

export interface CallDataSource {
  // Read
  get(id: number): Promise<Call | null>;
  getCalls(): Promise<Call[]>;
  // Write
  create(args: CreateCallArgs): Promise<Call>;
}
