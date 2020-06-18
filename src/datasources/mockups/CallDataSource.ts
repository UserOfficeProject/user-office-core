import { Call } from '../../models/Call';
import { CreateCallArgs } from '../../resolvers/mutations/CreateCallMutation';
import {
  UpdateCallArgs,
  AssignInstrumentToCallArgs,
  RemoveAssignedInstrumentFromCallArgs,
} from '../../resolvers/mutations/UpdateCallMutation';
import { CallDataSource } from '../CallDataSource';
import { CallsFilter } from './../../resolvers/queries/CallsQuery';

export const dummyCall = new Call(
  1,
  'shortCode',
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  '',
  '',
  1
);

export class CallDataSourceMock implements CallDataSource {
  async get(id: number): Promise<Call | null> {
    return dummyCall;
  }

  async getCalls(filter?: CallsFilter): Promise<Call[]> {
    return [dummyCall];
  }

  async create(args: CreateCallArgs) {
    return dummyCall;
  }

  async update(args: UpdateCallArgs) {
    return dummyCall;
  }

  async assignInstrumentToCall(args: AssignInstrumentToCallArgs) {
    return dummyCall;
  }

  async removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallArgs
  ) {
    return dummyCall;
  }
}
