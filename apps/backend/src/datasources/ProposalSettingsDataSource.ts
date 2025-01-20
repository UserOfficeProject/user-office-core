import { ProposalWorkflow } from '../models/ProposalWorkflow';

export interface ProposalSettingsDataSource {
  getProposalWorkflowByCall(callId: number): Promise<ProposalWorkflow | null>; //TODO: Move this to Call Data Source
}
