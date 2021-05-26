import { Call } from '../models/Call';
import { CreateCallInput } from '../resolvers/mutations/CreateCallMutation';
import {
  UpdateCallInput,
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
} from '../resolvers/mutations/UpdateCallMutation';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

export interface CallDataSource {
  getCall(id: number): Promise<Call | null>;
  getCalls(filter?: CallsFilter): Promise<Call[]>;
  create(args: CreateCallInput): Promise<Call>;
  update(args: UpdateCallInput): Promise<Call>;
  delete(id: number): Promise<Call>;
  assignInstrumentsToCall(args: AssignInstrumentsToCallInput): Promise<Call>;
  removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallInput
  ): Promise<Call>;
  getCallsByInstrumentScientist(scientistId: number): Promise<Call[]>;
  checkActiveCall(callId: number): Promise<boolean>;
}
