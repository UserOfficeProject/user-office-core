import { Call } from '../models/Call';
import { CreateCallArgs } from '../resolvers/mutations/CreateCallMutation';
import {
  UpdateCallInput,
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
  AssignOrRemoveProposalWorkflowToCallInput,
} from '../resolvers/mutations/UpdateCallMutation';
import { CallsFilter } from './../resolvers/queries/CallsQuery';

export interface CallDataSource {
  get(id: number): Promise<Call | null>;
  getCalls(filter?: CallsFilter): Promise<Call[]>;
  create(args: CreateCallArgs): Promise<Call>;
  update(args: UpdateCallInput): Promise<Call>;
  assignInstrumentsToCall(args: AssignInstrumentsToCallInput): Promise<Call>;
  removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallInput
  ): Promise<Call>;
  assignProposalWorkflowToCall(
    args: AssignOrRemoveProposalWorkflowToCallInput
  ): Promise<Call>;
  removeAssignedProposalWorkflowFromCall(
    args: AssignOrRemoveProposalWorkflowToCallInput
  ): Promise<Call>;
}
