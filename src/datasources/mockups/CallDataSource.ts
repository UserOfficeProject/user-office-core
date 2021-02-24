import { Call } from '../../models/Call';
import { CreateCallInput } from '../../resolvers/mutations/CreateCallMutation';
import {
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
  UpdateCallInput,
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
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  '',
  '',
  1,
  false,
  false,
  false,
  1
);

export const anotherDummyCall = new Call(
  2,
  'shortCode2',
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  '',
  '',
  1,
  true,
  false,
  false,
  1
);

export const dummyCalls = [dummyCall, anotherDummyCall];

export class CallDataSourceMock implements CallDataSource {
  async delete(id: number): Promise<Call> {
    return dummyCall;
  }
  async get(id: number): Promise<Call | null> {
    const call = dummyCalls.find(dummyCallItem => dummyCallItem.id === id);

    if (call) {
      return call;
    } else {
      return null;
    }
  }

  async getCalls(filter?: CallsFilter): Promise<Call[]> {
    if (filter?.isReviewEnded === false) {
      return dummyCalls.filter(dummyCallItem => !dummyCallItem.callReviewEnded);
    }

    if (filter?.isEnded === false) {
      return dummyCalls.filter(dummyCallItem => !dummyCallItem.callEnded);
    }

    return dummyCalls;
  }

  async create(args: CreateCallInput) {
    return { ...dummyCall, ...args };
  }

  async update(args: UpdateCallInput) {
    const indexOfCallToUpdate = dummyCalls.indexOf(dummyCall);

    dummyCalls[indexOfCallToUpdate] = { ...dummyCall, ...args };

    return dummyCalls[indexOfCallToUpdate];
  }

  async assignInstrumentsToCall(args: AssignInstrumentsToCallInput) {
    return dummyCall;
  }

  async removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallInput
  ) {
    return dummyCall;
  }

  async getCallsByInstrumentScientist(scientistId: number): Promise<Call[]> {
    return dummyCalls;
  }
}
