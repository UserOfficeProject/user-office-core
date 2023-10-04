import { Call, CallHasInstrument } from '../models/Call';
import { CreateCallInput } from '../resolvers/mutations/CreateCallMutation';
import {
  UpdateCallInput,
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
  UpdateSepToCallInstrumentInput,
} from '../resolvers/mutations/UpdateCallMutation';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

export interface CallDataSource {
  getCall(id: number): Promise<Call | null>;
  getCalls(filter?: CallsFilter): Promise<Call[]>;
  getCallHasInstrumentsByInstrumentId(
    instrumentId: number
  ): Promise<CallHasInstrument[]>;
  create(args: CreateCallInput): Promise<Call>;
  update(args: UpdateCallInput): Promise<Call>;
  delete(id: number): Promise<Call>;
  assignInstrumentsToCall(args: AssignInstrumentsToCallInput): Promise<Call>;
  updateSepToCallInstrument(
    args: UpdateSepToCallInstrumentInput
  ): Promise<Call>;
  removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallInput
  ): Promise<Call>;
  getCallsByInstrumentScientist(scientistId: number): Promise<Call[]>;
  isCallEnded(callId: number, checkIfInternalEnded: boolean): Promise<boolean>;
  isCallEnded(callId: number): Promise<boolean>;
}
