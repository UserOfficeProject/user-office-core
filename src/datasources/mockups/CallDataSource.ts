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

const dummyCalls = [dummyCall];

export class CallDataSourceMock implements CallDataSource {
  async get(id: number): Promise<Call | null> {
    const call = dummyCalls.find(dummyCallItem => dummyCallItem.id === id);

    if (call) {
      return call;
    } else {
      return null;
    }
  }

  async getCalls(filter?: CallsFilter): Promise<Call[]> {
    return [dummyCall];
  }

  async create(args: CreateCallArgs) {
    return { ...dummyCall, ...args };
  }

  async update(args: UpdateCallArgs) {
    return { ...dummyCall, ...args };
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
