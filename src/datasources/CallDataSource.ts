import { Call } from '../models/Call';
import { CreateCallArgs } from '../resolvers/mutations/CreateCallMutation';
import {
  UpdateCallArgs,
  AssignInstrumentToCallArgs,
  RemoveAssignedInstrumentFromCallArgs,
  AssignOrRemoveProposalWorkflowToCallInput,
} from '../resolvers/mutations/UpdateCallMutation';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

export interface CallDataSource {
  // Read
  get(id: number): Promise<Call | null>;
  getCalls(filter?: CallsFilter): Promise<Call[]>;
  // Write
  create(args: CreateCallArgs): Promise<Call>;
  update(args: UpdateCallArgs): Promise<Call>;
  assignInstrumentToCall(args: AssignInstrumentToCallArgs): Promise<Call>;
  removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallArgs
  ): Promise<Call>;
  assignProposalWorkflowToCall(
    args: AssignOrRemoveProposalWorkflowToCallInput
  ): Promise<Call>;
  removeAssignedProposalWorkflowFromCall(
    args: AssignOrRemoveProposalWorkflowToCallInput
  ): Promise<Call>;
}
