import { Call } from '../models/Call';
import { CallHasInstrument } from '../models/CallHasInstrument';
import { Workflow } from '../models/Workflow';
import { CreateCallInput } from '../resolvers/mutations/CreateCallMutation';
import {
  UpdateCallInput,
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
  UpdateFapToCallInstrumentInput,
} from '../resolvers/mutations/UpdateCallMutation';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

export interface CallDataSource {
  getCall(id: number): Promise<Call | null>;
  getCalls(filter?: CallsFilter): Promise<Call[]>;
  getCallHasInstrumentsByInstrumentIds(
    instrumentIds: number[]
  ): Promise<CallHasInstrument[]>;
  create(args: CreateCallInput): Promise<Call>;
  update(args: UpdateCallInput): Promise<Call>;
  delete(id: number): Promise<Call>;
  assignInstrumentsToCall(args: AssignInstrumentsToCallInput): Promise<Call>;
  updateFapToCallInstrument(
    args: UpdateFapToCallInstrumentInput
  ): Promise<Call>;
  removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallInput
  ): Promise<Call>;
  getCallsByInstrumentScientist(scientistId: number): Promise<Call[]>;
  isCallEnded(callId: number, checkIfInternalEnded: boolean): Promise<boolean>;
  isCallEnded(callId: number): Promise<boolean>;
  getCallByAnswerIdProposal(answerId: number): Promise<Call>;
  getProposalWorkflowByCall(callId: number): Promise<Workflow | null>;
}
